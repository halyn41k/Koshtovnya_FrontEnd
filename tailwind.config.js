// tailwind.config.js
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./public/index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
        base:    ['var(--font-base)'],
      },
      fontSize: {
        h1:       'var(--h1)',
        h2:       'var(--h2)',
        h3:       'var(--h3)',
        h6:       'var(--h6)',
        body1:    'var(--body1)',
        body2:    'var(--body2)',
        body3:    'var(--body3)',
        body4:    'var(--body4)',
        subtitle1:'var(--subtitle1)',
        subtitle2:'var(--subtitle2)',
        btnlg:    'var(--button-lg)',
        btnmd:    'var(--button-md)',
        btnsm:    'var(--button-sm)',
        table:    'var(--table-col)',
        label:    'var(--label)',
        input:    'var(--input-text)',
        overline: 'var(--overline)',
      },
      colors: {
        /* Базові */
        primary:         'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        disabled:        'var(--color-disabled-bg)',
        card:            'var(--color-card)',
        stroke:          'var(--color-stroke)',

        /* Info / Error */
        info: {
          main:     'var(--info-main)',
          contrast: 'var(--info-contrast)',
        },
        error: {
          main:     'var(--error-main)',
          dark:     'var(--error-dark)',
          light:    'var(--error-light)',
          contrast: 'var(--error-contrast)',
        },

        /* Semantic (Name/Value) */
        semantic: {
          primary:   'var(--semantic-primary)',
          secondary: 'var(--semantic-secondary)',
          tertiary:  'var(--semantic-tertiary)',
        },

        /* Warning / Success */
        warning: {
          main:      'var(--warning-main)',
          contrast:  'var(--warning-contrast)',
          highlight: 'var(--warning-highlight)',
        },
        success: {
          main:      'var(--success-main)',
          contrast:  'var(--success-contrast)',
          highlight: 'var(--success-highlight)',
        },

        /* Action states */
        action: {
          active:   'var(--action-active)',
          hover:    'var(--action-hover)',
          selected: 'var(--action-selected)',
          disabled: 'var(--action-disabled)',
        },

        /* Primary palette */
        palettePrimary: {
          main:     'var(--palette-primary-main)',
          dark:     'var(--palette-primary-dark)',
          light:    'var(--palette-primary-light)',
          contrast: 'var(--palette-primary-contrast)',
        },

        /* Text on dark bg */
        'text-on-dark': {
          primary:   'var(--text-on-dark-primary)',
          secondary: 'var(--text-on-dark-secondary)',
          tertiary:  'var(--text-on-dark-tertiary)',
          disabled:  'var(--text-on-dark-disabled)',
        },

        /* Backgrounds */
        background: {
          'body-1':  'var(--bg-body-1)',
          'body-2':  'var(--bg-body-2)',
          'body-3':  'var(--bg-body-3)',
          'body-4':  'var(--bg-body-4)',
          'body-5':  'var(--bg-body-5)',
          disabled:  'var(--bg-disabled)',
        },

        /* Checkbox */
        checkbox: {
          DEFAULT: 'var(--checkbox-default)',
          active:  'var(--checkbox-active)',
        },
      },
    },
  },
  plugins: [
    require('daisyui'),
    plugin(function ({ addComponents }) {
      addComponents({
        '.btn-s': {
          display:       'inline-flex',
          height:        '32px',
          padding:       '6px 10px',
          justifyContent:'center',
          alignItems:    'center',
          gap:           '6px',
          borderRadius:  '8px',
          background:    'var(--btn-bg)',
          fontSize:      'var(--button-sm)',
        },
        '.btn-m': {
          display:       'inline-flex',
          height:        '40px',
          padding:       '10px 20px',
          justifyContent:'center',
          alignItems:    'center',
          gap:           '6px',
          borderRadius:  '8px',
          background:    'var(--btn-bg)',
          fontSize:      'var(--button-md)',
        },
        '.btn-hover': {
          background: 'var(--btn-hover)',
        },
        '.btn-disabled': {
          background: 'var(--btn-disabled)',
        },
      })
    }),
  ],
}
