import { Routes } from '@angular/router';
import { Clients } from './components/admin/clients/clients';
import { Home } from './components/home/home';
import { ClientDetail } from './components/client/client';
import { Login } from './components/login/login';
import { Profile } from './components/profile/profile';
import { Contact } from './components/contact/contact';
import { Register } from './components/register/register';
import { ClientForm } from './components/client-form/client-form';
import { AdminPanel } from './components/admin/admin-panel/admin-panel';
import { ClientDietPlan } from './components/client-diet-plan/client-diet-plan';
import { About } from './components/about/about';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },
    {
        path: 'clients',
        component: Clients,
    },
    {
        path: 'clients/:id',
        component: ClientDetail,
    },
    {
        path: 'client-info',
        component: ClientDetail,
    },
    {
        path:'login',
        component: Login
    },
    {
        path:'profile',
        component: Profile
    },
    {
        path: 'admin/users/:id',
        component: Profile
    },
    {
        path:'register',
        component: Register
    },
    {
        path:'client/create',
        component: ClientForm
    },
    {
        path:'contact',
        component: Contact
    },
    {
        path:'admin',
        component: AdminPanel
    },
    {
        path:'diet-plan',
        component: ClientDietPlan
    },
    {
        path:'about',
        component: About
    }
];
