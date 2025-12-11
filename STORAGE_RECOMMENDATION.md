# Resume Storage Recommendation

## Current Situation
- ✅ Storing full file buffer (PDF/DOCX) in database
- ✅ Storing parsed text
- ✅ Storing analysis results

## Recommended Approach: **Don't Store File, Store Only Parsed Data**

### Why This Makes Sense:

#### ✅ **Pros of NOT storing files:**
1. **Privacy & Security**
   - Reduces risk if database is compromised
   - Better GDPR/compliance (less personal data stored)
   - Users feel more secure

2. **Storage Costs**
   - PDFs/DOCX files are large (often 100KB-5MB each)
   - Parsed text is much smaller (~5-50KB)
   - Significant cost savings at scale

3. **Performance**
   - Faster queries (smaller documents)
   - Less memory usage
   - Better database performance

4. **Legal Compliance**
   - Easier to comply with data deletion requests
   - Less liability for storing personal documents

#### ⚠️ **Cons:**
1. Can't re-download original file
2. Can't regenerate parsed text if extraction improves
3. Users must re-upload for new analyses

### **Recommended Solution:**

**Store:**
- ✅ Parsed text (`parsedData.text`)
- ✅ File metadata (fileName, contentType, uploadDate)
- ✅ Analysis results (Match documents)
- ✅ User ID for tracking

**Don't Store:**
- ❌ Original file buffer (`data: Buffer`)
- ❌ File path (if using file system)

### **Implementation:**
1. Extract text immediately after upload
2. Store only parsed text + metadata
3. Discard file buffer after extraction
4. Keep analysis results linked to resumeId

### **Migration Path:**
1. ✅ Update Resume model to make `data` optional - **DONE**
2. ✅ Update upload route to not save buffer - **DONE**
3. ✅ Add cleanup script to remove existing buffers (optional) - **DONE** (`backend/scripts/cleanup-resume-files.js`)
4. ✅ Verify code uses `parsedData.text` instead of `resume.data` - **VERIFIED**

### **Next Steps:**
1. Test the upload flow - new resumes won't store file buffers
2. (Optional) Run cleanup script to remove existing file buffers:
   ```bash
   node backend/scripts/cleanup-resume-files.js
   ```
3. Monitor storage usage - should see significant reduction

### **Alternative: Temporary Storage**
If you need the file temporarily:
- Store in memory during processing
- Or use temporary file storage (S3, local temp) with auto-delete
- Delete after text extraction completes

