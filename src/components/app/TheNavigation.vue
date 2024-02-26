<template>
  <v-container pa-0>
    <v-card>
      <v-navigation-drawer
        v-model="drawer"
        app
        clipped
        class="ma-4"
        color="main"
        height="auto"
        min-height="400pc"
        width="350"
        :floating="$vuetify.breakpoint.lgAndUp"
        :mini-variant="$vuetify.breakpoint.lgAndUp"
        :expand-on-hover="$vuetify.breakpoint.lgAndUp"
      >
        <v-list>
          <v-list-item class="centerName">
            <v-list-item-icon>
              EBAT
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                <h1>EBAT</h1>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider />

        <v-list>
          <v-list-item two-line class="px-2">
            <v-list-item-avatar>
              <v-img v-if="imgURL !== 'none'" :src="imgURL"></v-img>
              <span v-else class="userCircle">
                {{ name.charAt(0) }}{{ surname.charAt(0) }}
              </span>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title">{{
                fullName
              }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-icon v-if="role === ''" color="red">
                  mdi-account-alert
                </v-icon>
                {{ role !== 'none' ? role : 'No Access' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider />

        <v-list>
          <v-list-item-group>
            <template
              v-for="route in routes"
              :to="route.child ? false : route.path"
            >
              <template v-if="route.child && route.menuLevel == 0">
                <v-list-group
                  ref="listGroup"
                  :key="route.name"
                  color="lvl2_menu"
                >
                  <template v-slot:activator>
                    <v-list-item-icon>
                      <v-icon>{{ route.icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="route.name"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </template>

                  <v-list-item
                    v-for="item in route.child"
                    :key="item"
                    :to="routes.find(e => e.name === item).path"
                    color="lvl2_menu"
                  >
                    <v-list-item-icon>
                      <v-icon color="lvl2_menu_icon"
                        >{{ routes.find(e => e.name === item).icon }}
                        <!-- small class="pl-1" -->
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content class="pl-5">
                      <v-list-item-title
                        v-text="routes.find(e => e.name === item).name"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-group>
              </template>

              <template v-else-if="route.menuLevel == 0">
                <v-list-item ref="listItem" :key="route.name" :to="route.path">
                  <v-list-item-icon>
                    <v-icon>{{ route.icon }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ route.name }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </template>
          </v-list-item-group>
        </v-list>

        <v-list>
          <v-list-item @click="toggleTheme">
            <v-list-item-icon>
              <v-icon :class="themeState.theme"> {{ themeIcon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content class="noWrap"
              >Change theme</v-list-item-content
            >
          </v-list-item>
          <v-list-item
            href="https://w3.ibm.com/w3publisher/w3-privacy-notice"
            target="_blank"
            rel="noopener noreferrer"
          >
            <v-list-item-icon> <v-icon>mdi-security</v-icon></v-list-item-icon>
            <v-list-item-content style="max-height:3rem">
              IBM Privacy Notice
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="name !== ''" @click="logout">
            <v-list-item-icon>
              <v-icon color="deepOrange">mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Logout</v-list-item-content>
          </v-list-item>
          <v-list-item v-if="name === ''" to="/">
            <v-list-item-icon>
              <v-icon color="yellow">mdi-login</v-icon>
            </v-list-item-icon>
            <v-list-item-content class="noWrap">Log in</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-card>
    <v-btn
      class="d-lg-none mt-2 ml-n2"
      color="main"
      fixed
      left
      fab
      small
      @click="drawer = !drawer"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import { useTheme } from '@/composables/theme';
import { mapGetters, mapState } from 'vuex';
import { ROUTES } from '../../router/index';
import { auth_service } from '../../services/auth.service';
const { toggleTheme, themeState } = useTheme();

export default {
  name: 'TheNavigation',

  data() {
    return {
      drawer: true,
      selection: '',
      toggleTheme,
      themeState
    };
  },

  computed: {
    ...mapState({
      role: state => state.user.role,
      primary: state => state.user.primary,
      name: state => state.user.name,
      surname: state => state.user.surname,
      userState: state => state.user.user_state,
      imgURL: state => state.user.image
    }),
    ...mapGetters('user', ['getFullName']),
    routes() {
      return Object.keys(ROUTES).reduce((r, route) => {
        if (this.primary !== '') {
          if (ROUTES[route].menu && this.hasAccess(ROUTES[route])) {
            r.push(ROUTES[route]);
            // Check if last route has child
            if (r[r.length - 1].child) {
              //Iterate through every children
              r[r.length - 1].child = r[r.length - 1].child.reduce(
                (arrChild, child) => {
                  // Get whole children object
                  const ch = Object.values(ROUTES).find(
                    item => item.name === child
                  );
                  // Check if child should be rendered to current user
                  if (ch.menu && this.hasAccess(ch)) arrChild.push(child);
                  else if (ch.menu && !ch.authorized) arrChild.push(child);
                  // Return reducer
                  return arrChild;
                },
                []
              );
            }
          }
        } else if (ROUTES[route].menu && !ROUTES[route].authorized) {
          r.push(ROUTES[route]);
        }
        return r;
      }, []);
    },
    fullName() {
      return this.getFullName;
    },
    themeIcon() {
      if (themeState.theme === 'light') {
        return 'mdi-moon-waning-crescent';
      } else {
        return 'mdi-white-balance-sunny';
      }
    }
  },

  mounted() {
    themeState.theme = localStorage.getItem('@theme');
  },

  methods: {
    hasAccess(route) {
      if (route.roles == null) return true;
      const ha = route.roles.filter(role => {
        return this.role
          ? this.role.toLowerCase() === role.toLowerCase()
          : false;
      });
      return ha.length > 0;
    },
    logout() {
      auth_service.logout(this);
    }
  }
};
</script>

<style lang="scss" scoped>
.noWrap {
  white-space: nowrap;
}
.userCircle {
  background: #4a148c;
  border-radius: 50px;
  padding: 1rem;
}
.centerName {
  margin-left: -0.35rem;
}
</style>
