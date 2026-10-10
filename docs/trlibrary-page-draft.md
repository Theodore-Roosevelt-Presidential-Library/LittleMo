# Draft: trlibrary.com Little Missouri River page

Suggested URL: `trlibrary.com/visit/little-missouri-river` (or a child of `/visit/national-park`). Build in Layout Builder per the Outline Page-Building Playbook; the tool goes in with the embed snippets below.

**SEO title:** The Little Missouri River at Medora: Today's Conditions and History | Theodore Roosevelt Presidential Library
**Meta description:** Live river conditions at Medora, paddling levels and flood stages, beside the river Theodore Roosevelt ranched on in the 1880s, with 120 years of gage records and then-and-now maps.
**OG image:** `https://littlemo.labs.trlibrary.com/assets/photos/hero-cottonwoods.jpg` (swap for an Acquia DAM river photo)

---

## The Little Missouri

Theodore Roosevelt stepped off the train beside this river in September 1883. He ran cattle on its bottoms, built his home ranch on its west bank, chased boat thieves down it through the ice and wrote that it could be a trickle "not ankle deep" one evening and "swimming-deep for the horses" by morning. It still can.

### The river today

*[Embed: compact or today view]*

```html
<div data-little-mo="today" data-heading="off"></div>
<script src="https://littlemo.labs.trlibrary.com/embed.js" async></script>
```

Readings come every 15 minutes from the U.S. Geological Survey gage at the Medora bridge. Paddlers want at least 699 cubic feet per second; May and June are usually best.

### Then and now

No one measured the river while Roosevelt lived here. The first gage readings at Medora were taken in 1903. His books and letters fill the gap: the Ox-bow ice jam of March 1886, the drought that summer and the hard winter that followed.

```html
<div data-little-mo="then" data-heading="off"></div>
```

### The river moves

Government survey plats, aerial photographs from 1939 and 1957, and today's imagery, at Medora and at the Elkhorn Ranch.

```html
<div data-little-mo="maps" data-heading="off"></div>
```

### Plan your day on the river

- Canoe or kayak from Medora: see the National Park Service's paddling guide and get a free backcountry permit for overnight trips.
- Walk to the Elkhorn: [Elkhorn Ranch Walking Guide](https://elkhornguide.labs.trlibrary.com/)
- Start at the Library: [Plan your visit](https://www.trlibrary.com/visit)

---

**Homepage or sidebar card:**

```html
<div data-little-mo="compact" data-more="https://www.trlibrary.com/visit/little-missouri-river"></div>
<script src="https://littlemo.labs.trlibrary.com/embed.js" async></script>
```

**FAQ block (for AI search):**
- *Can you canoe the Little Missouri River at Medora?* Yes, when the Medora gage reads at least about 699 cubic feet per second (2.5 ft); May and June are usually best. Live readings: littlemo.labs.trlibrary.com.
- *Where did Theodore Roosevelt ranch on the Little Missouri?* At the Maltese Cross, about seven miles south of Medora, and the Elkhorn, about 35 miles north, both in the river valley.
- *How long have river records been kept at Medora?* Since 1903, with gaps; Roosevelt's years (1883–1898) have no measurements.
