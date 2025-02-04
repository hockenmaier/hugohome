App.modules.lines = (function() {
    function runLinesModule() {
        const linesList = [];
        const { engine, world } = window.BallFall || {};
        if (!engine || !world) return;
        
        const Bodies = Matter.Bodies,
            World  = Matter.World;
        
        let firstClick = null;
        let previewLine = null;
        let hoveredLine = null;
        let pendingDeletionLine = null;
        let deletionTimer = null;
        let touchStartPos = null;
        
        function removePreview() {
        if (previewLine) {
            World.remove(world, previewLine);
            previewLine = null;
        }
        }
        
        function updatePreview(mouseX, mouseY) {
        if (!firstClick) return;
        removePreview();
        
        const dx = mouseX - firstClick.x,
                dy = mouseY - firstClick.y,
                length = Math.sqrt(dx*dx + dy*dy),
                angle = Math.atan2(dy, dx),
                midX = (firstClick.x + mouseX) / 2,
                midY = (firstClick.y + mouseY) / 2;
        
        previewLine = Bodies.rectangle(midX, midY, length, App.config.lineThickness, {
            isStatic: true,
            angle: angle,
            render: {
            fillStyle: 'rgba(149,110,255,0.5)',
            strokeStyle: 'rgba(149,110,255,0.5)',
            lineWidth: 1
            }
        });
        World.add(world, previewLine);
        }
        
        function isNonInteractable(e) {
        return !e.target.closest('a, button, input, textarea, select, label');
        }
        
        function getLineAtPoint(x, y) {
        for (let body of linesList) {
            if (Matter.Vertices.contains(body.vertices, {x, y})) {
            return body;
            }
        }
        return null;
        }
        
        // Animation loop for pulsing effect.
        function updatePulse() {
        const timeFactor = Date.now() / 200;
        const t = (Math.sin(timeFactor) + 1) / 2;
        
        // Update hovered line pulse.
        if (hoveredLine) {
            let r = Math.round(149 + (255 - 149) * t);
            let g = Math.round(110 * (1 - t));
            let b = Math.round(255 * (1 - t));
            let color = `rgb(${r},${g},${b})`;
            hoveredLine.render.fillStyle = color;
            hoveredLine.render.strokeStyle = color;
        }
        // Update pending deletion line pulse.
        if (pendingDeletionLine && pendingDeletionLine !== hoveredLine) {
            let r = Math.round(149 + (255 - 149) * t);
            let g = Math.round(110 * (1 - t));
            let b = Math.round(255 * (1 - t));
            let color = `rgb(${r},${g},${b})`;
            pendingDeletionLine.render.fillStyle = color;
            pendingDeletionLine.render.strokeStyle = color;
        }
        
        requestAnimationFrame(updatePulse);
        }
        updatePulse();
        
        document.addEventListener('mousemove', (e) => {
        const mouseX = e.pageX - window.scrollX,
                mouseY = e.pageY - window.scrollY;
        
        if (firstClick) {
            updatePreview(mouseX, mouseY);
        }
        
        const line = getLineAtPoint(mouseX, mouseY);
        if (line) {
            if (hoveredLine !== line) {
            if (hoveredLine) {
                hoveredLine.render.fillStyle = '#956eff';
                hoveredLine.render.strokeStyle = '#956eff';
            }
            hoveredLine = line;
            }
            document.body.style.cursor = "pointer";
        } else {
            if (hoveredLine) {
            hoveredLine.render.fillStyle = '#956eff';
            hoveredLine.render.strokeStyle = '#956eff';
            hoveredLine = null;
            }
            document.body.style.cursor = "";
        }
        });
        
        // Desktop: right-click deletion.
        document.addEventListener('contextmenu', (e) => {
        const mouseX = e.pageX - window.scrollX,
                mouseY = e.pageY - window.scrollY;
        
        if (firstClick) {
            removePreview();
            firstClick = null;
            e.preventDefault();
            return;
        }
        
        const line = getLineAtPoint(mouseX, mouseY);
        if (line) {
            World.remove(world, line);
            const idx = linesList.indexOf(line);
            if (idx !== -1) linesList.splice(idx, 1);
            e.preventDefault();
        }
        });
        
        // Click-to-draw.
        document.addEventListener('click', (e) => {
        if (!isNonInteractable(e)) return;
        
        window.BallFall.clearLines = () => {
            linesList.forEach(body => Matter.World.remove(world, body));
            linesList.length = 0;
        };
        
        const clickX = e.pageX - window.scrollX,
                clickY = e.pageY - window.scrollY;
        
        if (!firstClick) {
            firstClick = { x: clickX, y: clickY };
        } else {
            removePreview();
            const dx = clickX - firstClick.x,
                dy = clickY - firstClick.y,
                length = Math.sqrt(dx*dx + dy*dy),
                angle = Math.atan2(dy, dx),
                midX = (firstClick.x + clickX) / 2,
                midY = (firstClick.y + clickY) / 2;
        
            firstClick = null;
        
            const lineBody = Bodies.rectangle(midX, midY, length, App.config.lineThickness, {
            isStatic: true,
            angle: angle,
            render: {
                fillStyle: '#956eff',
                strokeStyle: '#956eff',
                lineWidth: 1
            }
            });
            World.add(world, lineBody);
            linesList.push(lineBody);
        }
        });
        
        // Mobile: support preview drawing and deletion.
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            const touch = e.touches[0],
                touchX = touch.pageX - window.scrollX,
                touchY = touch.pageY - window.scrollY;
            const line = getLineAtPoint(touchX, touchY);
            if (line) {
            // Deletion mode.
            touchStartPos = { x: touchX, y: touchY };
            pendingDeletionLine = line;
            deletionTimer = setTimeout(() => {
                World.remove(world, line);
                const idx = linesList.indexOf(line);
                if (idx !== -1) linesList.splice(idx, 1);
                pendingDeletionLine = null;
            }, App.config.lineDeleteMobileHold);
            } else {
            // Drawing mode.
            firstClick = { x: touchX, y: touchY };
            updatePreview(touchX, touchY);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (firstClick) {
            const touch = e.touches[0],
                    touchX = touch.pageX - window.scrollX,
                    touchY = touch.pageY - window.scrollY;
            updatePreview(touchX, touchY);
            }
            if (touchStartPos) {
            const touch = e.touches[0],
                    touchX = touch.pageX - window.scrollX,
                    touchY = touch.pageY - window.scrollY,
                    dx = touchX - touchStartPos.x,
                    dy = touchY - touchStartPos.y;
            if (Math.sqrt(dx * dx + dy * dy) > 10) {
                clearTimeout(deletionTimer);
                deletionTimer = null;
                if (pendingDeletionLine) {
                pendingDeletionLine.render.fillStyle = '#956eff';
                pendingDeletionLine.render.strokeStyle = '#956eff';
                }
                pendingDeletionLine = null;
                touchStartPos = null;
            }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (firstClick) {
            const touch = e.changedTouches[0],
                    touchX = touch.pageX - window.scrollX,
                    touchY = touch.pageY - window.scrollY,
                    dx = touchX - firstClick.x,
                    dy = touchY - firstClick.y;
            // If the line is too short, cancel drawing.
            if (Math.sqrt(dx * dx + dy * dy) < 7) {
                removePreview();
            } else {
                removePreview();
                const length = Math.sqrt(dx * dx + dy * dy),
                    angle = Math.atan2(dy, dx),
                    midX = (firstClick.x + touchX) / 2,
                    midY = (firstClick.y + touchY) / 2;
                const lineBody = Bodies.rectangle(midX, midY, length, App.config.lineThickness, {
                isStatic: true,
                angle: angle,
                render: {
                    fillStyle: '#956eff',
                    strokeStyle: '#956eff',
                    lineWidth: 1
                }
                });
                World.add(world, lineBody);
                linesList.push(lineBody);
            }
            firstClick = null;
            }
            if (pendingDeletionLine) {
            clearTimeout(deletionTimer);
            deletionTimer = null;
            pendingDeletionLine.render.fillStyle = '#956eff';
            pendingDeletionLine.render.strokeStyle = '#956eff';
            pendingDeletionLine = null;
            touchStartPos = null;
            }
        });
    }
    function init() {
      if (window.BallFall && window.BallFall.engine) {
        runLinesModule();
      } else {
        window.addEventListener("BallFallBaseReady", runLinesModule);
      }
    }
    return { init };
  })();