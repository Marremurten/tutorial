# Places Form Feature - Product Requirements Document

## 1. Executive Summary

**Feature Name:** places-form  
**Feature Type:** User-generated content submission form  
**Target Launch:** MVP Release  

### Vision
Enable community-driven growth of the Stockholm Places platform by allowing users to easily contribute their favorite places.

### Mission
Provide a simple, intuitive form for locals and visitors to share their discovered Stockholm places, fostering a collaborative community platform.

## 2. Problem Statement

### Current Pain Point
Users can only view places that were pre-populated in the database. There's no way for locals or visitors to contribute their own favorite Stockholm places, which limits the community-driven aspect and growth of the platform.

### Target Users
- **Local Stockholm residents** who want to share their favorite hidden gems and local spots
- **Recent visitors/tourists** who discovered amazing places during their trip and want to help future travelers  
- **New Stockholm residents** who found great places while exploring their new city

## 3. Core Functionality (MVP)

### Primary Features
1. **Place Submission Form**
   - Name field (required)
   - Description textarea (required)  
   - Category dropdown with predefined options (required)
   - Location address text input (required)
   - Anonymous submission (no user account required)

2. **Form Validation**
   - Required field validation
   - Character limits for description
   - Category selection from predefined list

3. **Success Flow**
   - Immediate database insertion (no approval process)
   - Success confirmation message
   - Redirect to home page
   - New place appears at top of places list

### Category Options
- Restaurant
- Cafe  
- Park
- Dog Walking
- Forest
- Museum
- Shopping
- Viewpoint
- Beach
- Other

## 4. User Experience

### Access Method
- Prominent "Add Place" button in the header/navigation of main page
- Clicking navigates to dedicated `/add-place` page
- Clean, focused form interface

### User Flow
1. User clicks "Add Place" button on home page
2. Navigates to `/add-place` form page
3. Fills out required fields (name, description, category, location)
4. Clicks "Submit" button
5. Form validates inputs
6. Success message displays
7. Redirects to home page
8. New place visible at top of list with success notification

### Post-Submission Experience
- Immediate place visibility (no moderation queue)
- Success notification: "Your place has been added successfully!"
- Place appears at top of home page list
- User can immediately see their contribution

## 5. Technical Requirements

### Frontend
- **Framework:** Next.js 15 with App Router
- **Form Library:** React hooks (useState, useForm) 
- **Styling:** Tailwind CSS v4
- **Validation:** Client-side form validation
- **UI Components:** Radix UI components for form elements

### Backend Integration
- **API Endpoint:** POST `/api/places`
- **Database:** MongoDB with Mongoose
- **Data Model:** Uses existing Place schema
- **Response:** JSON with created place data

### Form Fields Schema
```typescript
{
  name: string (required, max 100 chars)
  description: string (required, max 500 chars)  
  category: string (required, from predefined list)
  location: {
    address: string (required, max 200 chars)
    coordinates: { lat: 0, lng: 0 } // Default values for MVP
  }
  images: [] // Empty array for MVP
  submittedBy: "Anonymous" // Default value
}
```

## 6. Out of Scope (Future Features)

### Not Included in MVP
- User authentication/accounts
- Photo upload functionality
- Map integration for location selection
- Content moderation/approval workflow
- Location coordinate lookup/geocoding
- Edit/delete submitted places
- User profiles or submission history

## 7. Success Metrics

### Launch Metrics (First Month)
- Form submission completion rate > 80%
- 10+ new places added by users
- No critical form errors or submission failures

### Growth Metrics (3 Months)  
- 50+ user-submitted places
- Consistent weekly submissions
- Quality submissions (complete information)

## 8. Acceptance Criteria

### Form Functionality
- [ ] User can access form via "Add Place" button on home page
- [ ] All required fields must be filled to submit
- [ ] Form validates inputs before submission
- [ ] Error messages display for invalid/missing data
- [ ] Successful submission creates place in database
- [ ] User redirected to home page after submission

### User Experience
- [ ] Form loads in under 2 seconds
- [ ] Mobile-responsive design
- [ ] Clear field labels and placeholder text
- [ ] Success feedback after submission
- [ ] New place visible immediately on home page

### Technical Requirements
- [ ] Form integrates with existing POST `/api/places` endpoint
- [ ] Uses existing Place mongoose model
- [ ] Client-side validation prevents invalid submissions
- [ ] Server-side validation as backup
- [ ] Proper error handling for API failures

## 9. Timeline & Implementation

### Phase 1 - Form Creation (Week 1)
- Create `/add-place` page and route
- Build form component with Radix UI
- Implement client-side validation
- Style with Tailwind CSS

### Phase 2 - Integration (Week 1)  
- Connect form to existing API endpoint
- Add success/error handling
- Implement redirect flow
- Add navigation button to home page

### Phase 3 - Testing & Polish (Week 1)
- Test form submission end-to-end
- Mobile responsiveness testing
- Error scenario testing
- UI/UX refinements

## 10. Risk Mitigation

### Technical Risks
- **Risk:** Form submission failures
- **Mitigation:** Comprehensive error handling and validation

- **Risk:** Spam submissions
- **Mitigation:** Basic rate limiting, field validation

### User Experience Risks  
- **Risk:** Form abandonment
- **Mitigation:** Keep form simple, clear required fields

- **Risk:** Poor quality submissions
- **Mitigation:** Clear field labels, character limits, examples

---

*This PRD serves as the specification for implementing the places-form feature in the Stockholm Places project.*