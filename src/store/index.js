import Vue from 'vue';
import Vuex from 'vuex';

import { accesses } from './modules/access.module';
import { countries } from './modules/countries.module';
import { deals } from './modules/deals.module';
import { delegation } from './modules/delegation.module';
import { form } from './modules/form.module';
import { geos } from './modules/geos.module';
import { markets } from './modules/markets.module';
import { notifications } from './modules/notifications.module';
import { sockets } from './modules/sockets.module';
import { user } from './modules/user.module';
import { users } from './modules/users.module';
import { announcements } from './modules/announcements.module';
import { feedback } from './modules/feedback.module';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    accesses,
    countries,
    deals,
    delegation,
    form,
    geos,
    markets,
    notifications,
    sockets,
    user,
    users,
    announcements,
    feedback
  }
});
