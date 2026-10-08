/**
 * アプリ内の「使い方」に並べる説明
 *
 * @note
 * 画面の作りを変えたら、[`docs/usage.md`](../../../docs/usage.md) も
 * あわせて直すこと。片方だけ古くなると、利用者が迷う。
 */
export type GuideSection = {
  title: string
  body: string
}

export const guideSections: GuideSection[] = [
  {
    title: 'Two ways to print',
    body: [
      'Quick print sends text you enter or an image you select straight to the printer. It uses a fixed format and is useful for printing a single receipt quickly.',
      '',
      'Layout printing fills a saved layout with your content. Use it for business cards or other items that share a layout but have different content.',
    ].join('\n'),
  },
  {
    title: 'Three terms used in layout printing',
    body: [
      'A layout defines the appearance of a printout. Arrange text, images, QR codes, columns, dividers, blank lines and print timestamps.',
      '',
      'An input field is a part of a layout whose content can vary between print records, such as a name or an avatar image.',
      '',
      'A print record contains the values entered into the input fields. You can create any number of print records for one layout.',
      '',
      'Layouts and print records look similar in lists. The icon on the left distinguishes them: a frame represents a layout, and a sheet of paper represents a print record.',
    ].join('\n'),
  },
  {
    title: 'Print',
    body: [
      'Print records appear under Layout printing on the home screen. Tap a record to print it.',
      '',
      'Tap the pencil on the right to edit the values you entered.',
    ].join('\n'),
  },
  {
    title: 'Create a layout',
    body: [
      'Open Manage layouts from the home screen.',
      '',
      'Tap Add a layout to create one. Press and hold a row in the list to duplicate or delete it.',
    ].join('\n'),
  },
  {
    title: 'Arrange elements',
    body: [
      'Open a layout to see its elements in print order. Drag the handle on the right to reorder them.',
      '',
      'Tap Add an element to add one. Tap an element to change its font size, alignment and other settings.',
    ].join('\n'),
  },
  {
    title: 'Content source',
    body: [
      'For each element, choose fixed content or an input field as its content source.',
      '',
      'When using an input field, select which field supplies the content. If you need another field, add one at the end of the picker or from Input fields on the layout screen.',
      '',
      'Switching back to fixed content leaves the input field in the layout. Fields that no element references are marked as unused.',
    ].join('\n'),
  },
  {
    title: 'Enter print data',
    body: [
      'Open Print data from the layout screen and enter values into the input fields. Press and hold a record in the list to print, duplicate or delete it.',
      '',
      'If Skip this element when empty is enabled, an element with no value will not appear on the printout.',
      '',
      'Only fields referenced by an element can be edited. Other fields are grouped under Fields not used by this layout. Their saved values are preserved and become available again if an element references the field.',
    ].join('\n'),
  },
  {
    title: 'Check the print preview',
    body: [
      'Tap Print preview on the layout screen to check the approximate appearance before printing.',
      '',
      'This is an on-screen preview. Fonts and line spacing may differ on the actual printout.',
    ].join('\n'),
  },
]
