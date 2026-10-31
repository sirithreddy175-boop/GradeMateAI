# GradeMate AI

**Smarter Assessment. Teacher-Controlled Grading.**

GradeMate AI is an AI-assisted examination evaluation platform designed
to help teachers review handwritten answer sheets, evaluate answers
question by question, and prepare accurate, teacher-approved results.

The platform is designed around one principle: **AI recommends; the
teacher decides.**

## Project Overview

Teachers can create examinations, provide question papers and answer
keys, scan or upload student answer sheets, extract handwritten
responses, and use an AI grading workflow to recommend marks against the
teacher's answer key and marking rubric.

Teachers can review extracted text, inspect AI explanations, change
marks, provide feedback, and approve the final results.

## Key Features

### 1. Examination Creation

-   Create and manage examinations.
-   Upload question papers in PDF or image formats.
-   Create questions manually.
-   Add maximum marks, reference answers, alternative acceptable
    answers, concepts, and marking rubrics.
-   Review and correct extracted question-paper content.

### 2. Scan & Upload Answer Sheets

-   Capture answer-sheet pages using a supported device camera.
-   Upload PDF and image files.
-   Preview, reorder, crop, and retake pages where supported.
-   Associate answer sheets with an examination and student.
-   Preserve page references for teacher review.

### 3. Handwriting Recognition and Answer Extraction

-   Extract handwritten responses using a configured OCR service.
-   Organize extracted responses question by question.
-   Flag uncertain or unreadable text.
-   Allow teachers to correct extracted text or enter answers manually.

> OCR accuracy depends on handwriting quality, image clarity, language,
> and the configured OCR provider. Extraction should always be reviewed
> when uncertain.

### 4. AI-Assisted Grading

-   Use the configured Google AI Studio Gemma 4 integration.
-   Compare student answers with the official answer key and marking
    rubric.
-   Evaluate meaning and conceptual understanding rather than relying
    only on exact wording.
-   Identify correct, missing, and incorrect concepts.
-   Recommend partial marks where appropriate.
-   Provide an explanation for each recommended score.

AI-generated marks are recommendations and must be reviewed by the
teacher.

### 5. Teacher Review and Approval

-   View the scanned answer sheet alongside extracted answers.
-   Compare student responses with reference answers and rubrics.
-   Edit extracted text and recommended marks.
-   Add question-wise feedback.
-   Approve individual questions and final results.
-   Keep AI-recommended marks distinct from teacher-approved marks.

### 6. Teacher Preferences and Grading Profile

The preferences system is designed to support: - Grading style and
marking preferences. - Partial-credit and alternative-answer
preferences. - Answer clarity and organization expectations. -
Explanation detail preferences. - Feedback templates and custom
feedback. - Rubric suggestions. - Feedback prompts. - A teacher grading
profile informed by saved preferences and previous corrections.

Presentation and handwriting readability should be considered separately
from subject knowledge. Marks should only be deducted for presentation
when the teacher explicitly includes it in the marking rubric.

### 7. Multilingual Examination Support

The planned multilingual workflow includes: - Multilingual
question-paper viewing and entry. - Language selection for
examinations. - Original-script answer extraction where supported by
OCR. - Evaluation of answers in supported languages. - Optional
translations for teacher review. - Multilingual feedback and marksheets.

Language support depends on the configured OCR and AI services. A
language selector alone does not guarantee accurate handwriting
recognition or grading; each language must be tested.

### 8. Results

-   Question-wise marks.
-   Total and maximum marks.
-   Teacher-approved results.
-   Student-wise result views.
-   Printable marksheets.

Only genuine, reviewed results should be presented as final results.

## Technology

The project is built around the following technologies and services:

-   **Next.js** --- application framework.
-   **TypeScript** --- application development.
-   **Tailwind CSS** --- styling.
-   **shadcn/ui** --- interface components.
-   **Supabase** --- authentication, PostgreSQL database, and file
    storage.
-   **Google AI Studio / Gemma 4** --- AI-assisted answer evaluation.
-   **OCR provider** --- handwritten text extraction; configure and
    validate the provider used by the project.

The exact versions and provider capabilities should be checked against
the current project configuration.

## AI Model License and Attribution

GradeMate AI uses the **Gemma 4** model through the configured Google AI
Studio integration for AI-assisted answer evaluation.

- **Model:** Gemma 4 (confirm the exact model variant used by the deployed
  application in its configuration).
- **Model license:** Apache License 2.0.
- **Copyright / attribution:** Gemma 4 is provided by Google.
- **Official license:** <https://www.apache.org/licenses/LICENSE-2.0>
- **Official model information:** <https://ai.google.dev/gemma>

Gemma 4 is a third-party model and is not owned by the GradeMate AI
project. Use and redistribution of the model and its components must
follow the Apache License 2.0, including applicable copyright, license,
and NOTICE requirements. This README attribution does not replace the
full license text or any notices required when redistributing model
artifacts.

**Important:** The Gemma 4 model license is separate from the license
chosen for the GradeMate AI source code. No project-wide software license
is declared here. If you publish or redistribute this repository, add a
separate root-level `LICENSE` file stating the license you choose for
your own code. Do not label the entire project Apache-2.0 solely because
it uses Gemma 4.

## Application Workflow

``` text
Create an Exam
      |
      v
Upload Question Paper or Enter Questions
      |
      v
Add Reference Answers and Marking Rubric
      |
      v
Scan or Upload Student Answer Sheet
      |
      v
Extract Handwritten Answers (OCR)
      |
      v
Review and Correct Extracted Text
      |
      v
Evaluate Answers with Gemma 4
      |
      v
Teacher Reviews Marks and Feedback
      |
      v
Teacher Approves Final Results
      |
      v
Generate Result / Marksheet
```

## Getting Started

### Prerequisites

-   Node.js version supported by the project.
-   npm, pnpm, or the package manager specified by the repository.
-   A Supabase project.
-   Google AI Studio API access for the configured Gemma 4 integration.
-   Credentials for the OCR provider used by the application.

### Installation

Clone the repository:

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Install dependencies using the package manager indicated by the
lockfile. For example:

``` bash
npm install
```

Create a local environment file:

``` bash
cp .env.example .env.local
```

Add the environment variables required by the existing application.
Typical variables may include:

``` env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_AI_STUDIO_API_KEY=
```

Use the exact variable names expected by the current source code. Some
Supabase projects may use a publishable key variable instead of the
anon-key variable.

**Security notes:** - Never commit `.env.local` or real API keys. - Keep
the Google AI Studio API key on the server. - Never expose a Supabase
service-role key in browser code. - Configure private storage access and
row-level security in Supabase. - Do not paste secrets into screenshots,
issues, or public documentation.

Start the development server:

``` bash
npm run dev
```

Open `http://localhost:3000` in your browser.

Check the repository's `package.json` for the exact scripts and package
manager commands.

## Environment Configuration

Create an `.env.example` file containing variable names only, with empty
values. Include only variables that the current code actually uses.

  ---------------------------------------------------------------------------------
  Variable                          Purpose                 Exposure
  --------------------------------- ----------------------- -----------------------
  `NEXT_PUBLIC_SUPABASE_URL`        Supabase project URL    Browser-safe

  `NEXT_PUBLIC_SUPABASE_ANON_KEY`   Supabase client access  Browser-safe
  or the configured publishable-key under RLS               
  variable                                                  

  `GOOGLE_AI_STUDIO_API_KEY`        Gemma 4 API access      Server only

  OCR provider credentials          Handwriting extraction  Server only
  ---------------------------------------------------------------------------------

Do not publish real credentials in this README or in the repository.

## Responsible Use

GradeMate AI is intended to assist teachers, not replace their
professional judgment.

-   AI scores must be reviewed and approved by a teacher.
-   Uncertain OCR output must be flagged for review.
-   Alternative correct answers should be considered according to the
    teacher's rubric.
-   Historical teacher corrections should guide recommendations, not
    override the current answer key.
-   Student information and uploaded answer sheets must be handled
    securely.
-   Do not claim support for an OCR language or model capability until
    it has been tested.

## Current Development Status

Features and integrations may be at different stages of implementation.
Before presenting a feature as complete, verify it in the running
application and test its complete workflow.

Recommended validation checklist:

-   [ ] Teacher registration and login.
-   [ ] Exam creation and editing.
-   [ ] Question-paper upload and manual question entry.
-   [ ] Answer-sheet camera scanning.
-   [ ] PDF and image uploads.
-   [ ] Handwriting OCR and manual correction.
-   [ ] Question-wise Gemma 4 evaluation.
-   [ ] Teacher review and approval.
-   [ ] Feedback and teacher preferences.
-   [ ] Correction history and grading profile.
-   [ ] Multilingual question papers and answer sheets.
-   [ ] Approved results and printable marksheets.
-   [ ] Access control and storage security.

## Contributing

Contributions, bug reports, and suggestions are welcome.

When reporting an issue, include: 1. A clear description of the issue.
2. Steps to reproduce it. 3. Expected behavior. 4. Actual behavior. 5.
Relevant error messages, with all secrets and personal student
information removed.

## License

Choose and add a license before distributing this project publicly.
Until a license is added, do not assume that others have permission to
reuse, modify, or redistribute the code.

------------------------------------------------------------------------

**GradeMate AI --- Smarter Assessment. Teacher-Controlled Grading.**
