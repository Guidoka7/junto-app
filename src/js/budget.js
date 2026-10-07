import * as budget from '../features/budget-core.js';
import {personalFinance} from '../features/personal-core.js';
import * as savings from '../features/savings-core.js';
window.JuntoBudget=Object.freeze(budget);
window.JuntoPersonal=Object.freeze({personalFinance});
window.JuntoSavings=Object.freeze(savings);
