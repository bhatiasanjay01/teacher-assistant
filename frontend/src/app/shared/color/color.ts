import { EnumUtils } from '../utils/enum-utils';

export const textBlack = '#37352f';
export const textWhite = '#ffffffd9';
export const whitesmoke = '#fafafa';
export interface SpectrumColor {
  name: string;
  front_1: string;
  background_1: string;
  background_2: string;
  text_1: string;
  excited_1?: string;
}

export enum AppColorName {
  red = 'red',
  orange = 'orange',
  cyan = 'cyan',
  green = 'green',
  blue = 'blue',
  purple = 'purple',
  geekblue = 'geekblue',
  magenta = 'magenta',
  volcano = 'volcano',
  gold = 'gold',
  lime = 'lime',
  yellow = 'yellow',
  grey = 'grey',
}

export enum AppColorBackground {
  red = '#ffa7a0',
  yellow = '#f7eca1',
  orange = '#fff7e6',
  cyan = '#e6fffb',
  green = '#d4faae',
  blue = '#e6f4ff',
  purple = '#e7c3ff',
  geekblue = '#f0f5ff',
  magenta = '#fff0f6',
  volcano = '#fff2e8',
  gold = '#fff2b0',
  lime = '#fcffe6',
  grey = '#bbbbbb',
}

export function getAppColorBackground(color: AppColor, transparent = '2b') {
  if (!color) {
    console.error('No Color for the background');
    return '#ffffffdb';
  }
  return `${color}${transparent}`;
}

export function getAppColorBackgroundStrong(color: AppColor) {
  if (!color) {
    console.error('No Color for the background');
    return '#ffffffdb';
  }
  return `${color}ed`;
}

export function getColor(i: number) {
  const allValues = EnumUtils.getAllValues(AppColor);
  const count = allValues.length - 1;

  return allValues[i % count];
}

export enum AppColor {
  purple = '#a87de5',
  orange = '#f8aa57',
  cyan = '#81cdcd',
  green = '#93da71',
  blue = '#60aff8',
  geekblue = '#5c77e9',
  magenta = '#ec73b5',
  volcano = '#f58c69',
  gold = '#ffac00',
  lime = '#cbe783',
  red = '#f16a71',
  yellow = '#fadb14',
  grey = '#808080',
}
