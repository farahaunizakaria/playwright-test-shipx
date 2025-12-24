export interface EntityData {
    name: String;
    linkName: String;
    url: string;
}    

export interface ManageCategory{
    category: string;
    entities: EntityData[];
}

export const MANAGE_ENTITIES: ManageCategory[] = [
    {
        category: 'MANAGE',
        entities: [
            {
                name: 'Portal Companies',
                linkName: 'Portal Companies',
                url: '/manage/portal-companies',
            },
            {
                name: 'Companies',
                linkName: 'Companies',
                url: '/manage/companies',
            },
            {
                name: 'Employees',
                linkName: 'Employees',
                url: '/manage/employees',
            },
            {
                name: 'Roles',
                linkName: 'Roles',
                url: '/manage/roles',
            },
            {
                name:'Permissions',
                linkName: 'Permissions',
                url: '/manage/permissions',
            },
            {
                name: 'Feature Flags',
                linkName: 'Feature Flags',
                url: '/manage/feature-flag',
            },
            {
                name: 'Base Company Settings',
                linkName: 'Base Company Settings',
                url: '/manage/company-settings',
            },
            {
                name:'User Settings',
                linkName: 'User Settings',
                url: '/manage/user-settings',
            },
            {
                name: 'Counters',
                linkName: 'Counters',
                url: '/manage/counters',
            },
            {
                name: 'Document Creator Templates',
                linkName: 'Document Creator Templates',
                url: '/manage/document-templates',
            },
            {
                name: 'Process Flows',
                linkName: 'Process Flows',
                url: '/manage/process-flows',
            },
            {
                name: 'Document Generator',
                linkName: 'Document Generator',
                url: '/manage/document-generator',
            },
            {
                name:'Plugins',
                linkName: 'Plugins',
                url: '/manage/plugins',
            },
            {
                name:'Category',
                linkName: 'Categories',
                url: '/manage/categories',
            },
        ],
    },
    {
        category: 'CHARGE',
        entities:[
            {
                name: 'Charge Items',
                linkName: 'Charge Items',
                url: '/manage/charge-item',
      },
      {
                name: 'Charge Categories',
                linkName: 'Charge Categories',
                url: '/manage/charge-category',
      },
      {
                name: 'Quotations',
                linkName: 'Quotations',
                url: '/manage/quotation',
      },
      {
                name: 'Rates',
                linkName: 'Rates',
                url: '/manage/rate',
      },
       {
                name: 'Holidays',
                linkName: 'Holidays',
                url: '/manage/holiday',
      },
        ],
    },
    {
        category: 'TRANSPORT',
        entities:[
        {
                name: 'Booking Types',
                linkName: 'Booking Types',
                url: '/manage/booking-type',
      },
      {
                name: 'Job Types',
                linkName: 'Job Types',
                url: '/manage/job-type',
      },
      {
                name: 'Incentive Types',
                linkName: 'Incentive Types',
                url: '/manage/incentive-type',
      },
      {
                name: 'Staging Yards',
                linkName: 'Staging Yards',
                url: '/manage/staging-yard',
      },
      {
                name: 'Transport Area Codes',
                linkName: 'Transport Area Codes',
                url: '/manage/transport-area-code',
      },
      {
                name: 'Transport Zones',
                linkName: 'Transport Zones',
                url: '/manage/transport-zone',
      },
      {
                name: 'FAF Rates',
                linkName: 'FAF Rates',
                url: '/manage/faf-rate',
      },
        ],
    },
        {
        category: 'FINANCE',
        entities:[
        {
                name: 'Taxes',
                linkName: 'Taxes',
                url: '/manage/tax',
        },
        {
                name: 'Currencies',
                linkName: 'Currencies',
                url: '/manage/currency',
        },
        {
                name: 'Exchange Rates',
                linkName: 'Exchange Rates',
                url: '/manage/exchange-rate',
        },
        {
                name: 'GL Codes',
                linkName: 'GL Codes',
                url: '/manage/gl-code',
        },
        {
                name: 'Billing Units',
                linkName: 'Billing Units',
                url: '/manage/billing-unit',
        },
        {
                name: 'Period Closings',
                linkName: 'Period Closings',
                url: '/manage/period-closing',
        },
    ],
    },
        {
        category: 'INTEGRATE',
        entities:[
        {
                name: 'Mappings',
                linkName: 'Mappings',
                url: '/manage/mapping',
        },
        {
                name: 'Details',
                linkName: 'Details',
                url: '/manage/detail',
        },
        {
                name: 'Logs',
                linkName: 'Logs',
                url: '/manage/log',
        },
        {
                name: 'Bulk Import Functions',
                linkName: 'Bulk Import Functions',
                url: '/manage/bulk-import-function',
        },
        ],
    },
        {
        category: 'LOGS',
        entities:[
        {
                name: 'Vouchers',
                linkName: 'Vouchers',
                url: '/manage/voucher',
        },
        {
                name: 'Etc',
                linkName: 'Etc',
                url: '/manage/etc',
        },
        {
                name: 'Email',
                linkName: 'Email',
                url: '/manage/email',
        },
        {
                name: 'Webhook',
                linkName: 'Webhook',
                url: '/manage/webhook',
        },
        ],
    },
];

//get all entities as a flat array list
export function getAllManageEntities(): EntityData[] {
    return MANAGE_ENTITIES.flatMap(category => category.entities);
}

//find entitiy by name
export function getManageEntityByName(name: string): EntityData | undefined {
    return getAllManageEntities().find(entity => entity.name === name);
}
