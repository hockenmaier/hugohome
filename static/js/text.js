App.modules.text = (function() {
    function runTextModule() {
        if (window.innerWidth < 720) {  // We don't build colliders for text on mobile, because there isn't enough width regardless of having enough resources
            // Still fire the event, even on mobile
            window.dispatchEvent(new Event('BallFallTextReady'));
            return;
        }

        const { engine, world } = window.BallFall || {};
        if (!engine || !world) return;
    
        const Bodies = Matter.Bodies;
        const World = Matter.World;
        const Events = Matter.Events;
    
        function traceOutline(alphaData, w, h) {
            const edges = [];
            function alphaAt(x, y) {
            if (x < 0 || y < 0 || x >= w || y >= h) return 0;
            return alphaData[y * w + x];
            }
            for (let y = 0; y < h - 1; y++) {
            for (let x = 0; x < w - 1; x++) {
                const topLeft     = alphaAt(x,   y);
                const topRight    = alphaAt(x+1, y);
                const bottomLeft  = alphaAt(x,   y+1);
                const bottomRight = alphaAt(x+1, y+1);
                const squareIdx = (topLeft > 0 ? 8 : 0)
                                + (topRight > 0 ? 4 : 0)
                                + (bottomRight > 0 ? 2 : 0)
                                + (bottomLeft > 0 ? 1 : 0);

                if      (squareIdx === 1  || squareIdx === 14) edges.push({x, y: y+0.5}, {x: x+0.5, y: y+1});
                else if (squareIdx === 2  || squareIdx === 13) edges.push({x: x+0.5, y: y+1}, {x: x+1,   y: y+0.5});
                else if (squareIdx === 4  || squareIdx === 11) edges.push({x: x+0.5, y}, {x: x+1,   y: y+0.5});
                else if (squareIdx === 8  || squareIdx === 7)  edges.push({x, y: y+0.5}, {x: x+0.5, y});
                else if (squareIdx === 3  || squareIdx === 12) edges.push({x, y: y+0.5}, {x: x+1,   y: y+0.5});
                else if (squareIdx === 6  || squareIdx === 9)  edges.push({x: x+0.5, y}, {x: x+0.5, y: y+1});
            }
            }
            return edges;
        }

    
        // Shifts each point inward by a fixed distance from the shape’s center
        function shrinkEdges(localPts, dist) {
            return localPts.map(pt => {
            const length = Math.hypot(pt.x, pt.y);
            if (length <= dist) {
                // If already very close to center, collapse it
                return { x: 0, y: 0 };
            }
            const s = (length - dist) / length;
            return { x: pt.x * s, y: pt.y * s };
            });
        }
    
        function wrapTextNodes(root) {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
            const textNodes = [];
            while (walker.nextNode()) {
            let node = walker.currentNode;
            if (
                node.nodeValue.trim() &&
                node.parentNode &&
                !node.parentNode.closest('#ballfall-ui') &&   // Skip UI Elements
                !['SCRIPT','STYLE'].includes(node.parentNode.tagName)
            ) {
                textNodes.push(node);
            }
            }
            textNodes.forEach(node => {
            const text = node.nodeValue;
            if (!text.trim()) return;
            const parent = node.parentNode;
            if (!parent || ['SCRIPT','STYLE'].includes(parent.tagName)) return;
            const frag = document.createDocumentFragment();
            for (let char of text) {
                const span = document.createElement('span');
                span.textContent = char;
                frag.appendChild(span);
            }
            parent.replaceChild(frag, node);
            });
        }
        wrapTextNodes(document.body);
    
        function letterToBody(letterEl) {
            if (letterEl.tagName === 'IMG' && letterEl.closest('#ballfall-ui')) return null;
            const rect = letterEl.getBoundingClientRect();
            if (rect.width < 1 || rect.height < 1) return null;
    
            const off = document.createElement('canvas');
            off.width = Math.ceil(rect.width);
            off.height = Math.ceil(rect.height);
            const ctx = off.getContext('2d');
    
            ctx.font = window.getComputedStyle(letterEl).font;
            ctx.fillStyle = '#000';
            ctx.textBaseline = 'top';
            ctx.fillText(letterEl.textContent, 0, 0);
    
            const imgData = ctx.getImageData(0, 0, off.width, off.height).data;
            const alphaData = [];
            for (let i = 3; i < imgData.length; i += 4) {
            alphaData.push(imgData[i]);
            }
    
            const edges = traceOutline(alphaData, off.width, off.height);
            if (!edges.length) return null;
    
            const shiftX = rect.left + window.scrollX;
            const shiftY = rect.top + window.scrollY;
            edges.forEach(pt => {
            pt.x += shiftX;
            pt.y += shiftY;
            });
    
            const minX = Math.min(...edges.map(pt => pt.x));
            const minY = Math.min(...edges.map(pt => pt.y));
            const maxX = Math.max(...edges.map(pt => pt.x));
            const maxY = Math.max(...edges.map(pt => pt.y));
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
    
            // Move edges to local coords
            const localEdges = edges.map(pt => ({ x: pt.x - centerX, y: pt.y - centerY }));
            // Shrink polygon by 1px from center
            const shrunk = shrinkEdges(localEdges, 4);
    
            const body = Bodies.fromVertices(centerX, centerY, [shrunk], {
            isStatic: true,
            render: { visible: false }
            }, true);
    
            if (body) body.elRef = letterEl;
            return body;
        }
    
        const elements = Array.from(document.querySelectorAll('span, img'))
        .filter(el => !el.closest('#ballfall-ui'));

        elements.forEach(el => {
        const body = letterToBody(el);
        if (body) World.add(world, body);
        });

        //Now remove any colliders that were set for images in the UI:
        const uiImg = document.getElementById('bfui-image');
        if (uiImg) {
        // Copy to avoid issues while mutating the array
        world.bodies.slice().forEach(body => {
            if (body.elRef === uiImg) {
            Matter.World.remove(world, body);
            }
        });
        }

    
        Events.on(engine, 'collisionStart', evt => {
            evt.pairs.forEach(pair => {
            [pair.bodyA, pair.bodyB].forEach(b => {
                if (b.elRef && b.elRef.tagName === 'SPAN') {
                b.elRef.style.color = '#6eff94';
                }
            });
            });
        });
  
  
        window.dispatchEvent(new Event("BallFallTextReady"));
  }
  function init() {
    if (window.BallFall && window.BallFall.engine) {
      runTextModule();
    } else {
      window.addEventListener("BallFallBaseReady", runTextModule);
    }
  }
  return { init };
})();