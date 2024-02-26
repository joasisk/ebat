import Vue from 'vue';

var themeState = new Vue({
  data: {
    theme: 'dark'
  }
});

export function useTheme() {
  const toggleTheme = () => {
    themeState.theme = themeState.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('@theme', themeState.theme);
  };
  return { toggleTheme, themeState };
}
