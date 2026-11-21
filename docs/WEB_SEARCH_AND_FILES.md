# Baybble web search configuration

Baybble's automatic web search uses the Tavily Search API from the server-side chat function.

## Web search access

The integration uses Tavily's rate-limited keyless Search access by default, so a secret is not required for the initial preview. Tavily documents keyless Search and Extract access when the request includes `X-Tavily-Access-Mode: keyless`. Keyless access is rate-limited and its availability/limits may change.

For higher and more predictable usage, an account owner can optionally create a Tavily API key and add `TAVILY_API_KEY` as an encrypted/secret variable in Cloudflare under **Workers & Pages → baybble → Settings → Variables and Secrets**, for both **Preview** and **Production** environments. Redeploy after adding it.

Never add the key to frontend environment variables, source code, GitHub commits, or chat messages. The current code does not enable paid overages automatically.

If search is rate-limited, unavailable or returns no usable sources, Baybble continues with its normal model response while clearly telling the user that live web research was unavailable. It must not invent citations.

## Document attachments

The extraction endpoint supports text-based PDF, DOCX, TXT and CSV files up to 10 MB each. PDF extraction is limited to 60 pages and extracted text is capped at 50,000 characters per file. Image-only/scanned PDFs are not OCR'd in this release.

Authenticated conversation attachments are stored in the private Supabase bucket `baybble-conversation-files`. Extracted text is protected by the `baybble_attachments` table's Row Level Security policies. Guest attachments are processed for the current browser conversation only and are not persisted to cloud storage.

Uploaded document content is treated as untrusted data, not as instructions to the model.
