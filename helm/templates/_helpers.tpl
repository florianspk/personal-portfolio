{{- define "personal-portfolio.name" -}}
personal-portfolio
{{- end }}

{{- define "personal-portfolio.labels" -}}
app.kubernetes.io/name: {{ include "personal-portfolio.name" . }}
app.kubernetes.io/component: web
{{- end }}
