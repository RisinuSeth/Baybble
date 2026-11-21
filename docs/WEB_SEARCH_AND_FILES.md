# Baybble web search configuration

Baybble's automatic web search uses the Tavily Search API from the server-side chat function.

## Configure the key

1. Create or access a Tavily account and obtain an API key.
2. In Cloudflare, open **Workers & Pages → baybble → Settings → Variables and Secrets**.
3. Add `TAVILY_API_KEY` as an encrypted/secret variable for both **Preview** and **Production** environments.
4. Redeploy the relevant Pages deployment so the function receives the secret.

Never add the key to frontend environment variables, source code, GitHub commits, or chat messages.

The Tavily Researcher tier currently advertises 1,000 free API credits per month. Basic search requests consume one credit; availability and limits may change. Baybble does not enable paid overages automatically.

If the key is missing or search fails, Baybble continues with its normal model response while clearly telling the user that live web research was unavailable. It must not invent citations.

## Document attachments

The extraction endpoint supports text-based PDF, DOCX, TXT and CSV files up to 10 MB each. PDF extraction is limited to 60 pages and extracted text is capped at 50,000 characters per file. Image-only/scanned PDFs are not OCR'd in this release.

Authenticated conversation attachments are stored in the private Supabase bucket `baybble-conversation-files`. Extracted text is protected by the `baybble_attachments` table's Row Level Security policies. Guest attachments are processed for the current browser conversation only and are not persisted to cloud storage.

Uploaded document content is treated as untrusted data, not as instructions to the model.
