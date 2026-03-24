// Authored explainability content for the issue drawer.
// Keyed by axe ruleId — matches Rule.ruleId in rules.ts.
//
// Three fields per rule:
//   whyItMatters  — user impact, written for a developer audience
//   whoIsImpacted — which users and assistive technologies are affected
//   howToFix      — concrete remediation guidance beyond the axe helpUrl

export type RuleContent = {
  whyItMatters: string;
  whoIsImpacted: string;
  howToFix: string;
};

export const ruleContent: Record<string, RuleContent> = {
  "color-contrast": {
    whyItMatters:
      "Text with insufficient contrast becomes unreadable for users who cannot rely on color differentiation. This is one of the most common barriers in financial interfaces where small text and muted labels are frequently used for secondary information.",
    whoIsImpacted:
      "Users with low vision, color blindness, or age-related vision changes. Also affects users in bright environments or on low-quality displays.",
    howToFix:
      "Update the foreground color token to meet a minimum contrast ratio of 4.5:1 against the background for normal text, or 3:1 for large text (18px+ or 14px+ bold). Use a contrast checker before shipping. Avoid fixing contrast by darkening backgrounds — fix the text color.",
  },

  label: {
    whyItMatters:
      "Form inputs without programmatic labels are invisible to screen readers. Users navigating a loan application or account form will hear only 'edit text' with no context about what the field is asking for — a critical failure in any financial flow.",
    whoIsImpacted:
      "Screen reader users, voice control users (Dragon NaturallySpeaking), and users navigating by keyboard who rely on label focus behavior.",
    howToFix:
      "Wrap the input in a <label> element, or use htmlFor on a separate <label> that matches the input's id. Do not rely solely on placeholder text — placeholders disappear on input and are not announced as labels by screen readers. Do not use aria-label as a first choice; visible labels are always preferred.",
  },

  "autocomplete-valid": {
    whyItMatters:
      "Missing or incorrect autocomplete attributes force users to manually re-enter personal information they have already saved in their browser or password manager. In a multi-step loan application, this creates real friction for users with motor disabilities.",
    whoIsImpacted:
      "Users with motor impairments who rely on autofill, users with memory or cognitive disabilities, and power users who expect autofill to work correctly on standard form fields.",
    howToFix:
      "Add the appropriate autocomplete attribute value to each input. Common values: given-name, family-name, email, tel, street-address, postal-code, bday. Match the value to what the field actually collects. Do not use autocomplete='off' on fields that contain personal information.",
  },

  "select-name": {
    whyItMatters:
      "A select element without an accessible name is announced as a blank dropdown by screen readers. Users cannot determine what they are selecting, making form completion impossible without sighted assistance.",
    whoIsImpacted:
      "Screen reader users, voice control users who activate controls by name.",
    howToFix:
      "Add a visible <label> element associated via htmlFor, or add an aria-label if a visible label is genuinely not possible in the design. Never rely on surrounding text or placeholder options as a substitute for a programmatic label.",
  },

  "image-alt": {
    whyItMatters:
      "Images without alternative text are completely skipped or announced as a filename by screen readers. Informational images — like loan type diagrams or product illustrations — become invisible to users who cannot see them.",
    whoIsImpacted:
      "Blind users and low vision users relying on screen readers. Also affects users with images disabled.",
    howToFix:
      "Add an alt attribute to every img element. Write alt text that conveys the purpose of the image, not just its appearance. If the image is purely decorative, use alt='' to hide it from assistive technology. Never use the filename or 'image of' as alt text.",
  },

  "image-redundant-alt": {
    whyItMatters:
      "When an image's alt text repeats the adjacent visible text, screen reader users hear the same content twice. This creates a redundant and slightly disorienting reading experience.",
    whoIsImpacted:
      "Screen reader users navigating content that has both an image and a nearby text label describing the same thing.",
    howToFix:
      "If an image is adjacent to text that already describes it, set the alt attribute to an empty string (alt='') to mark it as decorative. The image adds visual reinforcement but the text already communicates the meaning.",
  },

  tabindex: {
    whyItMatters:
      "Positive tabindex values override the natural document tab order, creating an unpredictable and confusing keyboard navigation experience. Users tabbing through a form or interface will jump to unexpected locations.",
    whoIsImpacted:
      "Keyboard-only users, screen reader users navigating by Tab key, and users with motor disabilities who rely on sequential keyboard navigation.",
    howToFix:
      "Remove all tabindex values greater than 0. Use tabindex='0' to make a non-interactive element focusable, and tabindex='-1' to enable programmatic focus only. Fix the DOM order to reflect the intended reading and tab order instead of overriding it with tabindex.",
  },

  "scrollable-region-focusable": {
    whyItMatters:
      "A scrollable container that cannot receive keyboard focus is inaccessible to anyone who cannot use a mouse. Content inside the region may be completely unreachable.",
    whoIsImpacted:
      "Keyboard-only users and users with motor disabilities who navigate without a pointing device.",
    howToFix:
      "Add tabindex='0' to scrollable containers that are not otherwise interactive, so keyboard users can focus and scroll them. Ensure the element has an accessible name via aria-label or aria-labelledby so its purpose is announced when focused.",
  },

  "heading-order": {
    whyItMatters:
      "Heading levels that skip ranks (h1 to h3 with no h2) break the document outline that screen reader users rely on to navigate and understand page structure. On data-dense pages like support articles or transaction history, this makes it significantly harder to scan content efficiently.",
    whoIsImpacted:
      "Screen reader users who navigate by headings, users with cognitive disabilities who rely on clear page structure.",
    howToFix:
      "Ensure heading levels increment by one at a time. Use CSS to control visual size — do not choose heading levels based on how they look. Every page should have exactly one h1, and subsequent sections should use h2 through h6 in a logical nested order.",
  },

  "landmark-one-main": {
    whyItMatters:
      "Without a main landmark, screen reader users cannot skip past repeated navigation and jump directly to page content. Every page load requires navigating through the full sidebar and header before reaching the actual information.",
    whoIsImpacted:
      "Screen reader users and keyboard users who use landmark navigation shortcuts.",
    howToFix:
      "Wrap the primary page content in a <main> element. Each page should have exactly one <main>. Do not use role='main' on a div when a semantic <main> element is available.",
  },

  bypass: {
    whyItMatters:
      "Without a skip link or landmark structure, keyboard users must tab through every navigation item on every page load before reaching the content. On a dashboard with a sidebar and header, this can mean 10 or more Tab presses before reaching the first data table.",
    whoIsImpacted:
      "Keyboard-only users, screen reader users, and users with motor disabilities who find repeated navigation exhausting.",
    howToFix:
      "Add a visually hidden skip link as the first focusable element on the page that jumps to the main content area. Alternatively, ensure proper landmark regions (header, nav, main) are in place — most screen readers support landmark navigation as a bypass mechanism.",
  },

  "aria-required-attr": {
    whyItMatters:
      "ARIA roles have required attributes that tell assistive technologies how to interpret and interact with a component. Without them, the role is broken — a combobox without aria-expanded gives screen readers no information about whether the dropdown is open or closed.",
    whoIsImpacted:
      "Screen reader users interacting with custom interactive components like dropdowns, dialogs, grids, and tabs.",
    howToFix:
      "Check the WAI-ARIA specification for the required attributes of the role being used and add them. Common missing attributes: aria-expanded on combobox and button, aria-selected on option, aria-checked on checkbox role, aria-labelledby on dialog.",
  },

  "aria-roles": {
    whyItMatters:
      "Invalid ARIA role values are ignored by assistive technologies or cause unpredictable behavior. A typo like role='progress' instead of role='progressbar' means the element has no semantic meaning to a screen reader.",
    whoIsImpacted:
      "Screen reader users who rely on ARIA role semantics to understand custom UI components.",
    howToFix:
      "Use only valid WAI-ARIA role values. Check the ARIA specification or the MDN ARIA roles reference. Common mistakes: progress (not valid) instead of progressbar, toggle (not valid) instead of switch, dropdown (not valid) instead of listbox or combobox.",
  },

  "aria-hidden-focus": {
    whyItMatters:
      "A focusable element inside an aria-hidden container is invisible to the accessibility tree but still reachable by keyboard. Users tabbing through the interface will land on an element that screen readers cannot announce — a silent, confusing focus trap.",
    whoIsImpacted:
      "Screen reader users and keyboard users. This often manifests as a Tab stop that announces nothing.",
    howToFix:
      "Never place focusable elements (buttons, links, inputs) inside elements with aria-hidden='true'. If an element must be hidden from assistive technology, also remove it from tab order using tabindex='-1' on each focusable child, or restructure the markup so focusable content is outside the hidden region.",
  },

  "button-name": {
    whyItMatters:
      "A button without discernible text is announced as 'button' with no label — screen reader users cannot tell what it does. Icon buttons for actions like close, filter, or expand are the most common source of this failure in dashboard UIs.",
    whoIsImpacted:
      "Screen reader users, voice control users who activate buttons by name, and keyboard users who cannot see which button has focus.",
    howToFix:
      "Add visible text inside the button, or add an aria-label attribute that describes the action. For icon-only buttons, use aria-label='Close dialog' rather than leaving it empty. Do not use title as a substitute — it is not reliably announced by screen readers.",
  },

  "link-name": {
    whyItMatters:
      "Links without discernible text are announced as the URL or as 'link' with no context. In a list of transaction entries or scan results, multiple unlabeled links make it impossible for screen reader users to distinguish between them.",
    whoIsImpacted:
      "Screen reader users, voice control users who activate links by name.",
    howToFix:
      "Ensure every link has visible text that describes its destination or action. For image links, the alt text of the image becomes the link name — make sure it is descriptive. For icon links, add aria-label. Avoid generic link text like 'click here' or 'read more' without additional context.",
  },

  "td-headers-attr": {
    whyItMatters:
      "When a data cell references header IDs that do not exist in the table, the browser cannot establish the row/column relationship. Screen reader users navigating the transaction history table cell by cell will hear only the cell value with no column context — rendering complex financial data tables effectively unusable.",
    whoIsImpacted:
      "Screen reader users navigating data tables, particularly complex tables with multiple header levels.",
    howToFix:
      "Ensure every ID referenced in a headers attribute exists on a <th> element in the same table. Prefer using the scope attribute on <th> elements (scope='col' or scope='row') instead of headers for simpler tables — it is less error-prone and equally well supported.",
  },

  "th-has-data-cells": {
    whyItMatters:
      "A header cell with no associated data cells suggests a structural problem in the table markup — often a header that spans a column with no actual data, or a layout table incorrectly marked up as a data table. This breaks the table model that screen readers use to announce relationships.",
    whoIsImpacted:
      "Screen reader users relying on table navigation mode to understand financial data like statements, transaction history, or account summaries.",
    howToFix:
      "Ensure every <th> element has at least one data cell in its row or column. If a header appears to have no data cells, check whether the table structure correctly reflects the visual layout. Remove scope attributes from layout tables and ensure data tables use correct semantic structure.",
  },

  "scope-attr-valid": {
    whyItMatters:
      "An incorrect scope value on a table header gives screen readers the wrong directional relationship. A column header marked as scope='row' will be announced as a row header, causing every cell in the column to be described with the wrong context.",
    whoIsImpacted:
      "Screen reader users navigating tables, especially multi-column financial data tables like statements or transaction history.",
    howToFix:
      "Use scope='col' on column headers and scope='row' on row headers. For headers that span multiple columns or rows, use scope='colgroup' or scope='rowgroup'. Audit every <th> element in complex tables to confirm the scope matches the actual table structure.",
  },

  "table-duplicate-name": {
    whyItMatters:
      "When a table's summary attribute and caption element contain identical text, screen reader users hear the same description twice — once when entering the table and once when the caption is read. It creates a redundant experience with no added value.",
    whoIsImpacted:
      "Screen reader users who rely on the caption to understand a table's purpose before navigating into it.",
    howToFix:
      "If both a summary and a caption are present, ensure they serve different purposes — the caption names the table, the summary provides additional context about its structure. If they are identical, remove the summary attribute entirely and rely on the caption.",
  },
};
