# PTE Academic Route Groups Optimization

## 📋 Recommended Route Organization

### Current Structure Issues:
- `/pte/academic/*` should be in `(academic)` route group for different layout
- Missing route group boundaries for different user experiences
- Some routes may benefit from feature-based grouping

### ✅ Optimized Structure:

```
app/
├── layout.tsx                          # Root layout
├── (home)/                             # Marketing/Landing pages
│   ├── layout.tsx                      # Marketing layout
│   ├── page.tsx                        # Home page
│   ├── sign-in/
│   └── sign-up/
├── (auth)/                             # Authentication (rename login group)
│   ├── layout.tsx                      # Auth-specific layout
│   ├── sign-in/
│   └── sign-up/
├── (pte)/                              # PTE Application routes
│   ├── layout.tsx                      # Main PTE application layout
│   ├── page.tsx                        # PTE index/dashboard redirect
│   ├── dashboard/
│   ├── practice/
│   ├── analytics/
│   ├── profile/
│   ├── settings/
│   └── support/
└── (pte-academic)/                     # Academic-specific PTE routes
    ├── layout.tsx                      # Academic layout
    ├── dashboard/
    ├── practice/
    ├── settings/
    └── [category]/
```

## 🎯 Benefits of This Structure:

1. **Clear Separation**: Different route groups for different user experiences
2. **Layout Isolation**: Academic vs general users have different layouts
3. **Team Organization**: Easy to organize by development teams
4. **Scalability**: Easy to add new route groups for new features
5. **URL Consistency**: No conflicting paths between groups

## 🔧 Implementation Steps:

1. ✅ **Current** - Keep `(home)` group for marketing
2. ✅ **Current** - Keep main `pte/` structure  
3. 🔄 **Rename** - `(login)` to `(auth)` for consistency
4. ➕ **Add** - `(pte-academic)` route group for academic-specific routes
5. 🔄 **Update** - Navigation links to match new structure

## 📝 URL Mapping:

| Current URL | New URL | Notes |
|------------|---------|-------|
| `/sign-in` | `/auth/sign-in` | Route group change |
| `/sign-up` | `/auth/sign-up` | Route group change |
| `/pte/dashboard` | `/pte/dashboard` | No change |
| `/pte/academic/dashboard` | `/pte-academic/dashboard` | Route group change |
| `/pte/academic/practice` | `/pte-academic/practice` | Route group change |
| `/pte/academic/settings` | `/pte-academic/settings` | Route group change |

## 🚀 Implementation Priority:

1. **High Priority**: Fix academic route groups (user experience)
2. **Medium Priority**: Rename auth group for consistency
3. **Low Priority**: Feature-based route groups (future scalability)