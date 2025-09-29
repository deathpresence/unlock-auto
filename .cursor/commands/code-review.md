Review the changes of @branch:

- Think through how data flows in the app. Explain new patterns if they exist and why.
- Were there any changes that could affect infrastructure?
- Consider empty, loading, error and offilne states.
- If public API have changed, ensure backwards compat (or increment API version).
- Did we add unnecessary dependencies? If there is a heavy dependency, could we inline a more minimal version?
- If i18n is set up, are the strings added localized and new routes internationalized?
- Are there places we should use caching?
- Are we missing critical o11y or logging on backend changes?
