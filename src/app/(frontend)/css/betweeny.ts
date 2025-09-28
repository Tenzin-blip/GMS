// @ts-nocheck
import plugin from 'tailwindcss/plugin';

const clampValue = (min: string, max: string, unit = '') =>
    `clamp(${min}${unit}, calc(${min}${unit} + (${parseFloat(max) - parseFloat(min)} * ((100vw - 320px) / 1280))), ${max}${unit})`;

const extractUnit = (val: string) => {
    const match = val.match(/^(-?\d*\.?\d+)([a-z%]*)$/);
    return match ? { num: match[1], unit: match[2] || '' } : { num: val, unit: '' };
};

const resolveThemeValue = (themeSection: any, key: string) => {
    if (!themeSection) return key;
    return typeof themeSection[key] === 'string' ? themeSection[key] : themeSection[key]?.[0] ?? key;
};

const propertiesMap = {
    'text': 'font-size',
    'p': 'padding',
    'pt': 'padding-top',
    'pr': 'padding-right',
    'pb': 'padding-bottom',
    'pl': 'padding-left',
    'px': ['padding-left', 'padding-right'],
    'py': ['padding-top', 'padding-bottom'],
    'm': 'margin',
    'mt': 'margin-top',
    'mr': 'margin-right',
    'mb': 'margin-bottom',
    'ml': 'margin-left',
    'mx': ['margin-left', 'margin-right'],
    'my': ['margin-top', 'margin-bottom'],
    'w': 'width',
    'h': 'height',
    'max-w': 'max-width',
    'max-h': 'max-height',
    'min-w': 'min-width',
    'min-h': 'min-height',
};

export default plugin(function({ matchUtilities, theme }) {
    Object.keys(propertiesMap).forEach((prefix) => {
        const cssProps = propertiesMap[prefix];
        const themeSection =
            prefix.startsWith('p') || prefix.startsWith('m')
                ? theme('spacing')
                : prefix === 'text'
                    ? theme('fontSize')
                    : theme(prefix);

        matchUtilities(
            {
                [prefix]: (value) => {
                    if (!value.includes('~')) return {};

                    const [minRaw, maxRaw] = value.split('~');

                    let minVal = resolveThemeValue(themeSection, minRaw) || minRaw;
                    let maxVal = resolveThemeValue(themeSection, maxRaw) || maxRaw;

                    const normalize = (val: any) => {
                        const raw = Array.isArray(val) ? val[0] : val;
                        const { num, unit } = extractUnit(raw);
                        const px = unit === 'rem' ? parseFloat(num) * 16 : parseFloat(num);
                        return { px, unit };
                    };

                    const minParsed = normalize(minVal);
                    const maxParsed = normalize(maxVal);

                    const clampFontSize = clampValue(
                        minParsed.px.toString(),
                        maxParsed.px.toString(),
                        'px'
                    );

                    const styles: Record<string, string> = {};

                    if (Array.isArray(cssProps)) {
                        cssProps.forEach((prop) => (styles[prop] = clampFontSize));
                    } else {
                        styles[cssProps] = clampFontSize;
                    }

                    // ⏬ Also apply line-height if we're doing font-size
                    if (prefix === 'text') {
                        const minLine = Array.isArray(minVal) && minVal[1]?.lineHeight;
                        const maxLine = Array.isArray(maxVal) && maxVal[1]?.lineHeight;

                        if (minLine && maxLine) {
                            const minL = normalize(minLine);
                            const maxL = normalize(maxLine);

                            const clampLineHeight = clampValue(
                                minL.px.toString(),
                                maxL.px.toString(),
                                'px'
                            );

                            styles['line-height'] = clampLineHeight;
                        }
                    }

                    return styles;
                }
            },
            { values: themeSection }
        );
        matchUtilities(
            {
                'space-x': (value) => {
                    if (!value.includes('~')) return {};
                    const [minRaw, maxRaw] = value.split('~');

                    let minVal = resolveThemeValue(theme('spacing'), minRaw) || minRaw;
                    let maxVal = resolveThemeValue(theme('spacing'), maxRaw) || maxRaw;

                    const normalize = (val: any) => {
                        const raw = Array.isArray(val) ? val[0] : val;
                        const { num, unit } = extractUnit(raw);
                        const px = unit === 'rem' ? parseFloat(num) * 16 : parseFloat(num);
                        return { px, unit };
                    };

                    const minParsed = normalize(minVal);
                    const maxParsed = normalize(maxVal);

                    const clamp = clampValue(
                        minParsed.px.toString(),
                        maxParsed.px.toString(),
                        'px'
                    );

                    return {
                        '> :not([hidden]) ~ :not([hidden])': {
                            '--tw-space-x-reverse': '0',
                            'margin-left': `calc(${clamp} * calc(1 - var(--tw-space-x-reverse)))`,
                            'margin-right': `calc(${clamp} * var(--tw-space-x-reverse))`,
                        },
                    };
                },
                'space-y': (value) => {
                    if (!value.includes('~')) return {};

                    const [minRaw, maxRaw] = value.split('~');

                    let minVal = resolveThemeValue(theme('spacing'), minRaw) || minRaw;
                    let maxVal = resolveThemeValue(theme('spacing'), maxRaw) || maxRaw;

                    const normalize = (val: any) => {
                        const raw = Array.isArray(val) ? val[0] : val;
                        const { num, unit } = extractUnit(raw);
                        const px = unit === 'rem' ? parseFloat(num) * 16 : parseFloat(num);
                        return { px, unit };
                    };

                    const minParsed = normalize(minVal);
                    const maxParsed = normalize(maxVal);

                    const clamp = clampValue(
                        minParsed.px.toString(),
                        maxParsed.px.toString(),
                        'px'
                    );

                    return {
                        '> :not([hidden]) ~ :not([hidden])': {
                            '--tw-space-y-reverse': '0',
                            'margin-top': `calc(${clamp} * calc(1 - var(--tw-space-y-reverse)))`,
                            'margin-bottom': `calc(${clamp} * var(--tw-space-y-reverse))`,
                        },
                    };
                },
            },
            { values: theme('spacing') }
        );

    });
});