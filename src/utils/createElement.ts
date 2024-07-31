/**
 * A function to programatically create an element of any type
 * @param type what type of element is it
 * @param location to what element should it be added as a child to
 * @param options what additional items should be added, e.g. class, dataset, text, callback or attribute
 * @returns the HTML element
 */

export const createElement = (
  type: string,
  location: HTMLHeadElement | HTMLBodyElement,
  options = {}
) => {
  const element = document.createElement(type);

  Object.entries(options).forEach(([key, value]) => {
    if (key === 'class') {
      element.classList.add(value);
      return;
    }

    if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
      return;
    }

    if (key === 'text') {
      element.textContent = value;
      return;
    }

    if (key === 'callback') {
      element.onload = value;
      return;
    }

    element.setAttribute(key, value);
  });

  location.appendChild(element);
  return element;
};
