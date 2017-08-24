import faker from 'faker';
import moment from 'moment';

export default new class Mock {
	conversations(search) {
		let arr = [];

		if (!search) {
			arr.push({
				total : {
					all    : parseInt(Math.random() * 10, 10),
					unread : 1
				},
				list : new Array(3).fill(0).map((k, i) => {
					return {
						partner : {
							name   : faker.internet.userName(),
							id     : i,
							avatar : false
						},
						excerpt : faker.lorem.sentence(),
						date    : moment(faker.date.recent()).unix(),
						unread  : Math.random() < 0.5 ? parseInt(Math.random() * 10, 10) : 0
					};
				})
			});
		}

		arr.push({
			title : 'Recommended',
			list  : new Array(2).fill(0).map((k, i) => {
				return {
					partner : {
						name   : faker.name.findName(),
						id     : i,
						avatar : false
					},
					excerpt     : faker.lorem.sentence(),
					undeletable : true
				};
			})
		});

		return arr;
	}

	conversation(idx) {
		return new Array(1).fill(0).map((k, i) => {
			return {
				partner : {
					id         : i,
					name       : faker.name.findName(),
					lastaction : 'Subscribed to your Fan Club'
					// gender: 'Male' | undefined,
					// age: 18 | undefined,
					// language: 'English' | undefined,
					// avatar: false,
					// status: 'Offline',
					// price: 1.2
				},
				done : Math.random() < 0.25,
				list : new Array(12).fill(0).map((v, x) => {
					return {
						id       : i * x + x + i + 1,
						incoming : Math.random() < 0.5,
						text     : faker.lorem.sentence(),
						date     : moment(faker.date.past()).unix()
					};
				})
			};
		})[idx];
	}

	partner(id) {
		return {
			id,
			name       : faker.internet.userName(),
			lastaction : 'Subscribed to your Fan Club',
			nickname   : faker.name.findName(),
			gender     : 'Male',
			age        : `${Math.round(Math.random() * (70 - 18) + 18)} years old`,
			location   : faker.address.country(),
			preference : 'Heterosexual'
			// language: 'English' | undefined,
			// avatar: false,
			// status: 'Offline',
			// price: 1.2
		};
	}

	partnerMessage() {
		return {
			id       : 121211,
			incoming : true,
			text     : faker.lorem.sentence(),
			date     : moment(faker.date.recent()).unix()
		};
	}

	send(msg) {
		return {
			id       : 11111,
			incoming : false,
			text     : msg + ' -- server responded version',
			date     : moment(faker.date.recent()).unix()
		};
	}
}();
