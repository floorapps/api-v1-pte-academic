## Diagnosis
- Your URL uses `read_aloud` (underscore). The implemented route is `read-aloud` (hyphen): `app/pte/academic/practice/speaking/read-aloud/question/[id]/page.tsx`.
- Visiting the underscore path 404s because the route folder doesn’t exist.
- The detail page also returns `notFound()` if the ID doesn’t exist, the question is inactive, or the type isn’t `read_aloud`.

## Plan
- Add an alias for the underscore path so both work:
  - Middleware rewrite: map `/pte/academic/practice/speaking/read_aloud/...` → `/pte/academic/practice/speaking/read-aloud/...`.
  - Alternatively, add a mirror `app/pte/academic/practice/speaking/read_aloud/question/[id]/page.tsx` that re-uses the existing component.
- Standardize internal links to the hyphen path to avoid future confusion.
- Validate the ID is present and of type `read_aloud` by navigating from the listing page instead of pasting arbitrary IDs.

## Implementation Steps
1) Implement middleware rewrite for underscore → hyphen.
2) Optional: add mirror route folder for `read_aloud` using the same `QuestionPage` implementation.
3) Verify:
   - Navigate to both paths; both load 200.
   - Open from listing and confirm the ID resolves, prep/beep timing works, and attempts submission returns 201.
4) Leave DB untouched (no seed/reset) unless you approve later.

## Rollback and Safety
- Middleware-only change is reversible and has no DB impact.
- Mirror route re-uses existing component; no logic duplication.

Approve to proceed and I’ll implement the alias and validate both URLs end-to-end.