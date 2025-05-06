{{ if $menu }}
<!-- Custom pill menu: Home, Tags, About Me, dynamic Categories -->
<nav aria-label="{{ i18n `paige_menu` }}" class="paige-row-wide" id="paige-menu">
<ul class="align-items-center justify-content-center nav {{ if $pills }} nav-pills {{ else if $tabs }} nav-tabs {{ else if $underline }} nav-underline {{ end }}">
<li class="nav-item"><a class="nav-link" href="{{ relLangURL "" }}">Home</a></li>
<li class="nav-item"><a class="nav-link" href="{{ "/tags/" | relURL }}">Tags</a></li>
<li class="nav-item"><a class="nav-link" href="{{ "/about-me/" | relURL }}">About Me</a></li>
{{ range $name, $_ := site.Taxonomies.categories }}
<li class="nav-item"><a class="nav-link" href="{{ (printf "/categories/%s/" (urlize $name)) | relURL }}">{{ $name }}</a></li>
{{ end }}
</ul>
</nav>
{{ end }}
