import Vue from 'vue';
import Vuetify from 'vuetify';

import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  options: {
    customProperties: true
  },
  theme: {
    dark: true,
    themes: {
      light: {
        main: colors.deepPurple.lighten3,
        lvl2_menu_icon: colors.grey.lighten3,
        lvl2_menu: colors.blueGrey.darken3,
        primary: '#3f51b5',
        secondary: '#b0bec5',
        accent: '#8c9eff',
        error: colors.red.lighten1,
        red: colors.red.lighten1,
        redDark: colors.red.darken2,
        redLight: colors.red.lighten2,
        white: colors.white,
        black: colors.black,
        grey: colors.grey.lighten2,
        greyLight: '#cccccc',
        greyContrast: colors.grey.lighten4,
        greyDark: '#999999',
        blueGrey: colors.blueGrey.lighten2,
        blueGreyLight: colors.blueGrey.lighten4,
        purple: colors.purple.lighten2,
        deepPurple2: colors.deepPurple.lighten2,
        deepPurple3: colors.deepPurple.lighten3,
        toolbar: colors.deepPurple.lighten2,
        indigoDark: colors.indigo.lighten1,
        indigo: colors.indigo.lighten2,
        blue: colors.blue.lighten1,
        blueLight: colors.lightBlue.lighten1,
        cyan: colors.cyan.lighten1,
        green: colors.green.lighten1,
        greenLight: colors.lightGreen.lighten1,
        yellow: colors.yellow.lighten1,
        yellowAccent: colors.yellow.accent3,
        amber: colors.amber.lighten1,
        orange: colors.orange.lighten2,
        deepOrange: colors.deepOrange,
        deepOrange2: colors.deepOrange.lighten1,
        deepOrange3: colors.deepOrange.lighten2
      },
      dark: {
        main: colors.deepPurple,
        lvl2_menu_icon: '#9E9E9E',
        lvl2_menu: '#EBC786',
        primary: '#2196F3', //button...
        secondary: '#b0bec5',
        accent: '#8c9eff',
        error: '#b71c1c',
        red: colors.red,
        redDark: colors.red.darken4,
        redLight: colors.red.lighten2,
        white: colors.white,
        black: colors.black,
        grey: colors.grey,
        greyLight: '#E0E0E0',
        greyContrast: colors.grey.darken3,
        greyDark: '#616161',
        blueGrey: colors.blueGrey,
        blueGreyLight: colors.blueGrey.darken4,
        purple: colors.purple,
        deepPurple2: colors.deepPurple.darken2,
        deepPurple3: colors.deepPurple.darken3,
        toolbar: colors.deepPurple.darken3,
        indigoDark: colors.indigo.darken1,
        indigo: colors.indigo,
        blue: colors.blue,
        blueLight: colors.lightBlue.darken3,
        cyan: colors.cyan,
        green: colors.green,
        greenLight: colors.lightGreen,
        yellow: colors.yellow,
        yellowAccent: colors.yellow.accent4,
        amber: colors.amber,
        orange: colors.orange,
        deepOrange: colors.deepOrange,
        deepOrange2: colors.deepOrange.darken2,
        deepOrange3: colors.deepOrange.darken3
      }
    }
  }
});
