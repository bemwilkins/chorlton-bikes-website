# Chorlton Bikes Website - Design Proposal

## Design Philosophy: User Journey First

Instead of leading with "who we are," the site prioritizes **what visitors want to do**. Information about the organization is provided contextually within each action path.

---

## Proposed Site Structure

### 1. **Hero Section** (Above the fold)
**Three large, clear call-to-action buttons:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         [Request a Service]                     │
│         [Become a Member]                        │
│         [Donate]                                │
│                                                 │
│  Brief tagline: "Building a greener, more       │
│  connected community through sustainable        │
│  bike delivery services"                        │
└─────────────────────────────────────────────────┘
```

- **Visual**: Hero carousel with community images (keep existing)
- **Purpose**: Immediate clarity on what visitors can do
- **Design**: Three equal-width buttons, prominent, easy to tap on mobile

---

### 2. **Request a Service Section** (`#services`)

**When someone clicks "Request a Service":**

#### A. **Service Selection Cards** (Visual grid)
- **Community Services** (left column)
  - Shop N Drop (Unicorn)
  - Trishaw Rides (Community)
  - Bikes 4 Refugees
  - Community Deliveries
- **Commercial Services** (right column)
  - Commercial Deliveries
  - Trishaw Hire (Events/Weddings)
  - NHS Deliveries

#### B. **Service-Specific Inquiry Forms**

Each service card expands or links to a focused inquiry section with:

**Shop N Drop:**
- Context: "For people with mobility issues or other significant barriers getting to the Unicorn Grocery..."
- Inquiry method: Email prompt (simple, not intimidating)
- Email: `hello@chorltonbikes.coop` with subject line suggestion

**Trishaw Rides:**
- **Community**: Free rides through community organizations
  - Context: "We operate a Trishaw scheme across South Manchester, giving older people and those with limited mobility the opportunity to get out and about."
  - Inquiry: Email prompt
- **Commercial/Events**: Hire for special occasions
  - Context: "Perfect for weddings, birthdays, special events... Make your celebration memorable with our unique trishaw service."
  - Inquiry: Email prompt with event details template

**Bikes 4 Refugees:**
- Context: "We work with Refugee Aid to revive unused bikes for asylum-seekers and refugees."
- Inquiry: Airtable form with:
  - Photo upload field for the bike
  - Contact details
  - Bike condition/description

**Commercial Deliveries:**
- Context: "Green, reliable delivery services for businesses and public sector organisations..."
- Inquiry: Email prompt or simple contact form

**NHS Deliveries:**
- Context: "We're proud to keep vital services running with our ongoing NHS contract..."
- Information-focused (not inquiry form, as it's contract-based)

---

### 3. **Become a Member Section** (`#membership`)

**When someone clicks "Become a Member":**

#### A. **Three Pathways** (Visual cards)
1. **Become a Member** (£1 share)
   - Context: "As a Community Benefit Society, membership gives you an equal say in how we're run..."
   - Form: Airtable membership form
   
2. **Join as a Rider** (Volunteer or Paid)
   - Context: "Our pool of friendly dedicated riders is growing. We offer both volunteer and paid opportunities..."
   - Inquiry: **Email prompt only** (not a form - less intimidating)
   - Email: `hello@chorltonbikes.coop` with subject "Rider Application"
   
3. **Volunteer with Us**
   - Context: "There are many ways to get involved beyond riding..."
   - Inquiry: **Email prompt only**

#### B. **Why Join?** (Contextual information)
- Member-owned and community-focused
- Real Living Wage employer
- Voice in future direction
- Support a greener, more connected community

---

### 4. **Donate Section** (`#donate`)

**When someone clicks "Donate":**

#### A. **Friends of Chorlton Bikes Programme**
- Context: "Regular monthly donations help us plan ahead with confidence..."
- Goal: £1,000/month (100 people × £10/month)
- Impact: "80% of our costs go to people - our dedicated team of riders and staff"
- Form: Airtable donation form (embedded)

#### B. **What Your Donation Supports**
- Real Living Wage employment
- Community benefit projects
- Zero-emission delivery services
- Local community impact

---

### 5. **Social Media Feed Section** (`#updates`)

**Visual integration of Instagram/Facebook:**
- Embedded Instagram feed (using Instagram Basic Display API or embed)
- Or: Grid of recent posts with images
- Links to follow on social media
- Purpose: Keep content current and relevant without CMS

**Design options:**
- Option A: Instagram embed widget (official)
- Option B: Custom grid pulling latest 6-9 posts (images + links)
- Option C: Simple "Follow us" section with visual previews

---

### 6. **Partners Section** (`#partners`)

**Visual grid of partner logos:**
- From Open Social presentation
- Logos displayed in a grid
- Optional: Brief description of partnership
- Design: Clean, professional, not overwhelming

---

### 7. **About/Impact** (Contextual, not primary)

**Minimal "Who We Are" section:**
- Brief paragraph (keep existing)
- Key stats (keep existing 4 stats)
- Link to full impact details if needed
- **Position**: Near bottom, or accessible via navigation

**Full Impact Details:**
- Expandable or separate page with all 14 impact areas
- Accessible but not front-and-center

---

### 8. **Footer**
- Contact email
- Social links
- Copyright
- FCA registration (optional, minimal)

---

## Navigation Structure

**Simplified navigation:**
- Logo (home)
- Services
- Join Us
- Donate
- About (optional, minimal)

**Mobile:** Hamburger menu (keep existing)

---

## Key Design Principles

1. **Action-First**: Three primary CTAs in hero
2. **Contextual Information**: "Who we are" appears where relevant
3. **Low Friction**: Email prompts for volunteering (not forms)
4. **Visual**: Social media integration keeps content fresh
5. **Clear Pathways**: Each action has a clear, focused section
6. **Mobile-First**: All interactions work seamlessly on mobile

---

## Implementation Notes

### Email Prompts (Not Forms)
For "Join as a Rider" and "Volunteer":
- Large, friendly button: "Email Us to Get Started"
- Opens mailto link: `mailto:hello@chorltonbikes.coop?subject=Rider Application` (or appropriate subject)
- Brief text: "Just drop us an email - we'd love to hear from you!"

### Airtable Forms
- Membership form (embedded)
- Donation form (embedded)
- Bikes 4 Refugees form (with photo upload capability)

### Social Media Integration
- Instagram: Use Instagram Basic Display API or official embed
- Facebook: Embed Facebook page feed or link to page
- Visual previews of recent posts

### Service Inquiry Flow
- Each service has its own focused section
- Clear distinction: Community vs. Commercial
- Contextual information explains the service
- Simple inquiry method (email or form as appropriate)

---

## Visual Hierarchy

1. **Hero** → Three CTAs (most prominent)
2. **Selected Action Section** → Detailed information + inquiry method
3. **Social Updates** → Visual feed (keeps site fresh)
4. **Partners** → Trust and credibility
5. **About** → Supporting information (minimal)

---

## Next Steps

1. Review and approve this structure
2. Implement the new layout
3. Integrate Airtable forms
4. Set up social media feed
5. Add partner logos from presentation
6. Test user journeys

---

## Questions to Consider

1. **Social Media Feed**: Which platform is most active? (Instagram seems primary)
2. **Partners**: Can you provide a list of partners/logos from the presentation?
3. **Email Templates**: Should we include suggested email templates for inquiries?
4. **Service Prioritization**: Are some services more important to highlight than others?

