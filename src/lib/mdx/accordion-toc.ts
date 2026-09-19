const ACCORDION_HEADING = /<Accordion\b[^>]*>/g;

type AccordionAttribute = 'headingLevel' | 'id' | 'title';

export function addAccordionHeadingsToTocText(markdown: string) {
  return markdown.replace(ACCORDION_HEADING, (accordion) => {
    const headingLevel = getNumericAttribute(accordion, 'headingLevel');
    const id = getStringAttribute(accordion, 'id');
    const title = getStringAttribute(accordion, 'title');

    if (!headingLevel || !id || !title) {
      return accordion;
    }

    return `\n\n${'#'.repeat(headingLevel)} ${title} [#${id}]\n\n${accordion}\n`;
  });
}

function getNumericAttribute(tag: string, name: AccordionAttribute) {
  const value = getAttribute(tag, name);

  if (!value) {
    return undefined;
  }

  const number = Number(value);
  return Number.isInteger(number) && number >= 2 && number <= 4
    ? number
    : undefined;
}

function getStringAttribute(tag: string, name: AccordionAttribute) {
  return getAttribute(tag, name);
}

function getAttribute(tag: string, name: AccordionAttribute) {
  const attribute = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\\s*([^{}]+?)\\s*\\})`,
  ).exec(tag);

  return attribute?.[1] ?? attribute?.[2] ?? attribute?.[3];
}
