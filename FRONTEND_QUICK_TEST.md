# Frontend Optimization - Quick Test Guide

## Setup

### 1. Update Environment
```bash
cd /home/xettry/Desktop/Subash_thapa/client

# Ensure .env.local has correct API URL
cat .env.local
```

Expected content:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Output should show:
```
> next dev
  ▲ Next.js 15.5.18
  ✓ Ready in 2.3s
  ⚠ Ready on http://localhost:3000
```

## Testing

### Test 1: Blog Page Loading
```bash
# Open in browser
http://localhost:3000/blog

# Expected: Blog grid with 12 items appears in <2 seconds
# DevTools: Check Network tab for initial data request (~150ms)
```

### Test 2: Cache Hit Verification
```bash
# In browser console:
console.log('Check DevTools Network tab')

# Steps:
1. Navigate to http://localhost:3000/blog
2. Reload page (F5)
3. Check Network tab for /api/blogs request
4. First load: ~150ms
5. Reload: Should see no request or cached response
```

### Test 3: Sort Functionality
```
1. Visit http://localhost:3000/blog
2. Click "🔥 Trending" button
3. Wait for data to load (<50ms if cached)
4. Click "👁️ Most Viewed" button
5. Click back to "⏱️ Latest"

Expected: Instant switching, each sort mode shows different order
```

### Test 4: Pagination
```
1. Visit http://localhost:3000/blog
2. Scroll to bottom
3. Click "2" or next arrow (➡️)
4. New page loads <100ms
5. Click "1" or previous arrow (⬅️)
6. Back to first page

Expected: Smooth navigation, page state preserved
```

### Test 5: News Page
```bash
# Open in browser
http://localhost:3000/news

# Expected:
# - Breaking news section at top (red)
# - Featured section (yellow)
# - Latest news grid
# - Dark theme applied
# - All loads in <2 seconds
```

### Test 6: Cache Refresh Button
```
1. Visit http://localhost:3000/blog
2. See "Cache: X" indicator (next to refresh button)
3. Click refresh icon (⟳)
4. Page reloads with fresh data from server
5. Cache counter resets

Expected: Manual cache invalidation works
```

### Test 7: Like Functionality
```
1. Visit http://localhost:3000/blog (must be logged in)
2. Click heart icon on a blog card
3. Heart fills in red
4. Like count increases
5. Sort changes - heart state preserved
6. Click heart again to unlike

Expected: Like/unlike works, cache auto-invalidates
```

### Test 8: Performance Metrics
```
# In browser console:
1. Open DevTools Console tab
2. Reload page
3. Look for console logs:

[BLOG CACHE] all page 1: 145ms (Cache: MISS)
[BLOG CACHE] all page 1: 8ms (Cache: HIT)
[PERF] blog-page: pageLoad = 1234ms

Expected: Performance logs show timing data
```

### Test 9: Mobile Responsiveness
```
1. Open DevTools (F12)
2. Click device toolbar (mobile view)
3. Select iPhone 12
4. Reload http://localhost:3000/blog
5. Test on different screen sizes

Expected:
- Mobile: Single column grid
- Tablet: 2 column grid
- Desktop: 2-3 column grid
```

### Test 10: Tag Filtering
```
1. Navigate to http://localhost:3000/blog?tag=travel
2. Only blogs with "travel" tag show
3. Sort controls still work
4. Pagination works correctly

Expected: Tag-filtered blogs load correctly
```

## Performance Benchmarks

### Expected Response Times

| Action | Time | Status |
|--------|------|--------|
| Initial page load | <2s | ✓ |
| First data fetch | 100-150ms | ✓ |
| Cached data fetch | <50ms | ✓ |
| Sort switching | <100ms | ✓ |
| Pagination | <100ms | ✓ |
| Like/Unlike | <500ms | ✓ |
| Cache refresh | 100-150ms | ✓ |

## Browser DevTools Tips

### Network Tab
1. Open DevTools → Network tab
2. Reload page
3. Filter by "Fetch/XHR"
4. Look for `/api/blogs` requests
5. Check response time in "Time" column

### Console Tab
1. Open DevTools → Console tab
2. Look for [BLOG CACHE] and [PERF] logs
3. Verify performance metrics
4. Check for errors (should be none)

### Storage Tab
1. Open DevTools → Storage tab (or Application)
2. Check session data
3. Verify no excessive localStorage usage

## Troubleshooting

### Issue: Slow Initial Load
**Check**:
1. Is backend running? `curl http://localhost:5000/api/blogs`
2. Network latency? Check DevTools Network tab
3. Backend performance? Check server logs

**Solution**:
- Ensure backend server is running
- Check network connectivity
- Review backend performance metrics

### Issue: Cache Not Working
**Check**:
1. Console logs showing "MISS"? Normal on first load
2. Reload showing "HIT"? Good cache working
3. Are logs showing at all? Check NODE_ENV

**Solution**:
```bash
# Enable debug logging
NODE_ENV=development npm run dev
```

### Issue: Sort Not Switching
**Check**:
1. Are buttons clickable?
2. Does console show errors?
3. Is API responding?

**Solution**:
```bash
# Check API
curl "http://localhost:5000/api/blogs?sortBy=trending"

# Test in console
fetch('/api/blogs?sortBy=trending')
  .then(r => r.json())
  .then(console.log)
```

### Issue: Styles Not Applied
**Check**:
1. Is Tailwind working? (Check for class names)
2. Build complete? (No build errors)
3. Browser cache? (Hard refresh)

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
npm run dev
```

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Clear cache and rebuild
rm -rf .next && npm run build

# Check environment
cat .env.local

# Kill process on port 3000
lsof -i :3000 | awk 'NR!=1 {print $2}' | xargs kill -9
```

## Deployment Checklist

- [ ] Backend running and accessible
- [ ] API URL in `.env.production`
- [ ] Build passes: `npm run build`
- [ ] No console errors
- [ ] Cache hits showing in performance
- [ ] Mobile responsive working
- [ ] All sort modes functional
- [ ] Pagination working
- [ ] Like/Unlike functional
- [ ] Performance metrics acceptable

## Monitoring

Monitor these metrics in production:

1. **Cache Hit Rate**: Target >90%
   - Track in analytics or logs
   
2. **Page Load Time**: Target <1s
   - Monitor real user metrics (RUM)
   
3. **API Response Time**: Target <500ms
   - Check backend logs
   
4. **User Engagement**: Monitor likes, shares
   - Track in analytics
   
5. **Error Rate**: Target <1%
   - Monitor console errors

## Next Steps

1. **Deploy**: Push optimized pages to production
2. **Monitor**: Track real user performance
3. **Optimize**: Based on metrics, refine cache TTL
4. **Enhance**: Add ISR for static generation
5. **Analytics**: Integrate performance tracking

---

**Last Updated**: 2026-07-06
**Quick Reference Version**: 1.0
