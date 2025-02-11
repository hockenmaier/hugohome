Here is the config.yml I want to use when implementing Netlify:

collections:
  - name: "posts"
    label: "Posts"
    folder: "content/posts"
    create: true
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - { label: "Category", name: "categories", widget: "select", options: ["project overview", "project update", "essay", "thought"] }
      - { label: "Personal", name: "personal", widget: "select", options: ["Y", "N"] }
      - { label: "Stack", name: "stack", widget: "list", default: [] }
      - { label: "Project Link", name: "project_link", widget: "string", required: false }
      - { label: "GitHub Link", name: "github_link", widget: "string", required: false }
      - { label: "Short Description", name: "short_description", widget: "text" }
      - { label: "Tags", name: "tags", widget: "list", default: [] }
