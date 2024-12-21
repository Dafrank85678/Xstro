import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

export const AntiDelDB = DATABASE.define(
	'AntiDelete',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: false,
			defaultValue: 1,
		},
		gc_status: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		dm_status: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		tableName: 'antidelete',
		timestamps: false,
		hooks: {
			beforeCreate: record => {
				record.id = 1; // Force only one row with id 1
			},
			beforeBulkCreate: records => {
				records.forEach(record => {
					record.id = 1; // Force only one row with id 1
				});
			},
		},
	},
);

export async function initializeAntiDeleteSettings() {
	try {
		await AntiDelDB.findOrCreate({
			where: { id: 1 },
			defaults: { gc_status: false, dm_status: false },
		});
	} catch (error) {
		console.error('Error initializing anti-delete settings:', error);
	}
}

export async function setAnti(type, status) {
	try {
		// Ensure initialization
		await initializeAntiDeleteSettings();

		const record = await AntiDelDB.findByPk(1);

		if (type === 'gc') {
			record.gc_status = status;
		} else if (type === 'dm') {
			record.dm_status = status;
		}

		await record.save();
		return true;
	} catch (error) {
		console.error('Error setting anti-delete status:', error);
		return false;
	}
}

export async function getAnti(type) {
	try {
		// Ensure initialization
		await initializeAntiDeleteSettings();

		const record = await AntiDelDB.findByPk(1);

		if (type === 'gc') {
			return record.gc_status;
		} else if (type === 'dm') {
			return record.dm_status;
		}

		return false;
	} catch (error) {
		console.error('Error getting anti-delete status:', error);
		return false;
	}
}

export async function getAllAntiDeleteSettings() {
	try {
		await initializeAntiDeleteSettings();
		const record = await AntiDelDB.findByPk(1);
		return [
			{
				gc_status: record.gc_status,
				dm_status: record.dm_status,
			},
		];
	} catch (error) {
		console.error('Error retrieving all anti-delete settings:', error);
		return [];
	}
}