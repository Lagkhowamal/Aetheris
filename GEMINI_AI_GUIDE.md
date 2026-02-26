# Gemini AI Features in Medi-Chart-AI

This application uses Google Gemini AI to provide intelligent clinical support features.

## Features Enabled

### 1. **Patient Diagnosis Analysis** 🔍
**Location**: Chart Detail Page → "Analyze with AI" button

**How it works:**
- When you create or view a patient chart/encounter, click the "Analyze with AI" button
- Gemini analyzes the patient data and provides:
  - **Possible Conditions**: Differential diagnoses based on symptoms and vitals
  - **Recommended Tests**: Specific lab tests and diagnostics
  - **Suggested Treatments**: Evidence-based treatment options
  - **Red Flags**: Warning signs requiring immediate attention
  - **Summary**: Comprehensive clinical assessment

**Example usage:**
```
Patient: 45-year-old male
Chief Complaint: Chest pain and shortness of breath
Symptoms: Radiating pain to left arm, mild fever

AI Analysis Output:
- Possible Conditions: 
  * Acute Coronary Syndrome (High Priority)
  * Pulmonary Embolism
  * Pneumonia with pleurisy
- Red Flags: Radiating chest pain, SOB - Consider EMS/urgent evaluation
- Recommended Tests: EKG, Troponin, Chest X-ray, D-dimer
```

### 2. **AI Clinical Chat Assistant** 💬
**Location**: Chat section in the left sidebar

**How it works:**
- Start a new conversation or continue an existing one
- Ask Gemini about:
  - Specific diagnoses and differential diagnoses
  - Treatment protocols and medications
  - Test interpretations and results
  - Patient education materials
  - Clinical decision support
  - Medical research questions

**Example queries:**
- "What are the differential diagnoses for dyspnea in a 65-year-old with HTN?"
- "What's the current evidence for treating Type 2 Diabetes?"
- "How would you manage a patient with ACE inhibitor side effects?"
- "What diagnostic criteria should I consider for this patient's presentation?"

**Streaming responses**: Answers stream in real-time for faster information access

## Configuration

### Environment Variables
```env
GEMINI_API_KEY=your-actual-gemini-api-key
DATABASE_URL=postgresql://postgres:hagunaka@localhost:5432/medi_chart_ai
```

### Get a Gemini API Key
1. Visit [ai.google.dev](https://ai.google.dev)
2. Sign in with your Google account
3. Get API key from the console
4. Update your `.env` file

## Important Notes

⚠️ **Medical Disclaimers:**
- AI analysis is a **supplementary tool** only - not a replacement for professional medical judgment
- Always verify AI suggestions with current medical guidelines and patient-specific factors
- Red flags highlighted by AI should trigger immediate clinical evaluation
- Patient safety is your responsibility as the healthcare provider

## Technical Details

**Gemini Model Used**: `gemini-pro`
- Understands medical terminology and clinical context
- Can analyze complex patient scenarios
- Provides structured JSON responses for diagnosis analysis
- Streams responses for real-time chat interactions

**Prompting Strategy**:
- Detailed system context for clinical accuracy
- Structured output format for consistent analysis
- Patient-specific data integration for personalized assessment
- Evidence-based recommendation generation

## Testing

To test the AI features:

1. **Create a test patient** (or use John Doe):
   ```bash
   npx tsx seed-test-patient.ts
   ```

2. **Create a new chart** for the patient:
   - Go to Patient Detail
   - Click "New Chart"
   - Fill in chief complaint, symptoms, vitals
   - Click "Analyze with AI"

3. **Try the chat assistant**:
   - Go to Chat section
   - Start a new conversation
   - Ask a clinical question

## Tips for Best Results

1. **For Diagnosis Analysis**:
   - Include complete vital signs (temperature, BP, HR, RR, O2 sat)
   - List all reported symptoms clearly
   - Provide relevant medical history
   - Note any allergies and current medications

2. **For Chat Questions**:
   - Be specific about patient demographics and presentation
   - Provide context about what you've already considered
   - Ask follow-up questions to refine suggestions
   - Verify recommendations against your clinical judgment

3. **Handling Complex Cases**:
   - Break down the presentation into components
   - Ask about differential diagnoses one at a time
   - Request evidence-based recommendations
   - Use the "Red Flags" section for urgent decision-making

## Troubleshooting

**Error: "Failed to generate AI analysis"**
- Check that `GEMINI_API_KEY` is set correctly in `.env`
- Verify API key has valid quota
- Check server logs for detailed error messages

**No response from chat**
- Ensure database connection is active
- Check browser console for network errors
- Verify Gemini API key has active quota

**Incomplete or inconsistent analysis**
- Try reformulating the prompt with more specific details
- Include all vital signs and patient history
- Restart the conversation if tokens are depleted

## Future Enhancements

Potential improvements:
- [ ] Integration with patient EHR systems
- [ ] Support for medical image interpretation
- [ ] Batch analysis for multiple patients
- [ ] Custom prompt templates for specific conditions
- [ ] Integration with medical literature databases
- [ ] Multi-language support for global healthcare teams
