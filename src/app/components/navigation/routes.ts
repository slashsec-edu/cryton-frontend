export interface Route {
  name: string;
  icon?: string;
  href?: string;
  subroutes?: Route[];
}

export const routes: Route[] = [
  {
    name: 'Dashboard',
    icon: 'dashboard',
    href: './dashboard'
  },
  {
    name: 'Plan templates',
    icon: 'book',
    href: './templates',
    subroutes: [
      { name: 'List templates', href: './templates/list' },
      { name: 'Create template', href: './templates/create' },
      { name: 'Upload template', href: './templates/upload' }
    ]
  },
  {
    name: 'Instances',
    icon: 'category',
    href: './instances',
    subroutes: [
      { name: 'List instances', href: './instances/list' },
      { name: 'Create instance', href: './instances/create' }
    ]
  },
  {
    name: 'Workers',
    icon: 'construction',
    href: './workers',
    subroutes: [
      { name: 'List workers', href: './workers/list' },
      { name: 'Create worker', href: './workers/create' }
    ]
  },
  {
    name: 'Runs',
    icon: 'directions_run',
    href: './runs',
    subroutes: [
      { name: 'List runs', href: './runs/list' },
      { name: 'Create run', href: './runs/create' }
    ]
  }
];

export const metaRoutes: Route[] = [
  {
    name: 'Logs',
    icon: 'description',
    href: './logs'
  },
  {
    name: 'Help',
    icon: 'help',
    href: './help'
  }
];
