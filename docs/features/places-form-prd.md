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
   - Google Places Autocomplete for location (required, Stockholm-restricted)
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
- **Maps Integration:** Google Maps JavaScript API with Places Autocomplete

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
    address: string (from Google Places API)
    coordinates: { 
      lat: number, // From Google Places API geometry
      lng: number  // From Google Places API geometry
    }
    placeId: string // Google Places ID for reference
  }
  images: [] // Empty array for MVP
  submittedBy: "Anonymous" // Default value
}
```

### Google Places API Integration
- **Component:** Places Autocomplete with country restriction to Sweden
- **Bounds:** Stockholm metropolitan area (lat: 59.17-59.5, lng: 17.8-18.4)
- **Place Types:** All establishment types allowed
- **Required Fields:** geometry (coordinates), formatted_address, place_id
- **API Key:** Requires Google Maps JavaScript API key with Places API enabled

## 6. Out of Scope (Future Features)

### Not Included in MVP
- User authentication/accounts
- Photo upload functionality
- Interactive map display for location selection
- Content moderation/approval workflow
- Edit/delete submitted places
- User profiles or submission history
- Advanced place search filters

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
- [ ] Uses existing Place mongoose model (updated for placeId field)
- [ ] Google Places Autocomplete restricts results to Stockholm area
- [ ] Extracts coordinates automatically from selected place
- [ ] Client-side validation prevents invalid submissions
- [ ] Server-side validation as backup
- [ ] Proper error handling for API failures and Google API errors

## 9. Timeline & Implementation

### Phase 1 - Google Places Integration (Week 1)
- Set up Google Maps JavaScript API with Places Autocomplete
- Implement Stockholm area restrictions and bounds
- Build location input component with autocomplete
- Extract coordinates and place details from API response

### Phase 2 - Form Enhancement (Week 1)  
- Update existing form to use Google Places component
- Update Place mongoose model to include placeId field
- Connect enhanced form to existing API endpoint
- Add enhanced validation and error handling

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

## 11. Version History

### Version 2.0 - Google Places API Integration
**Date:** Current Update  
**Changes:**
- **BREAKING:** Replaced manual address text input with Google Places Autocomplete
- **ENHANCED:** Added automatic coordinate extraction from Google Places API
- **ADDED:** Place ID field for Google Places reference
- **RESTRICTED:** Location selection limited to Stockholm metropolitan area
- **UPDATED:** Technical requirements to include Google Maps JavaScript API
- **ENHANCED:** Form validation to handle Google API responses
- **UPDATED:** Timeline to reflect Google Places integration phases

### Version 1.0 - Initial MVP
**Date:** Original Implementation  
**Features:** Basic form with manual address input, category selection, and MongoDB storage

---

*This PRD serves as the specification for implementing the places-form feature in the Stockholm Places project.*