import Chaos from '../../../lib/chaos/Chaos';

import SliderPage from './SliderPage';

import '../Models/Models.scss';

export default function StatisticsTransactions(el, config) {
	StatisticsTransactions.superclass.constructor.call(this, el, config);
}

Chaos.extend(StatisticsTransactions, SliderPage, {});
