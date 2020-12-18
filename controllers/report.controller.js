const pdf = require("pdf-creator-node");
const fs = require('fs');
const moment = require('moment');
const cryptoRandomString = require('crypto-random-string');
const ReportModel = require("../models/report.model.js");


exports.createPdf = (req, res) => {
	const job_id = req.params.job_id;
	ReportModel.fetchReportData(job_id, (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || "Some error occurred while fetching Report data."
			});
		} else {
			const result = generateReport(data);
			res.send(result);
		}
	});

}

const generateReport = (data) => {
	// Read HTML Template
	const html = fs.readFileSync('template.html', 'utf8');

	const options = {
		format: "A3",
		orientation: "portrait",
		border: "10mm",
	}
	const jobDetails = {
		jobTitle: data[0].job_title,
		jobProvider: data[0].user_name,
		jobLocation: data[0].location,
		startDate: data[0].start_date,
		endDate: data[0].end_date
	}
	const employeesData = [];
	let subTotal = 0.0;
	let totalTime = 0.0;
	data.forEach(e => {
		const employee = {
			employeeName: e.user_name,
			regularHour: e.regular_hour,
			regularRate: e.regular_rate,
			regularAmount: e.regular_amount.toFixed(2),
			otHour: 0,
			otRate: 0,
			otAmount: 0,
			amount: `$ ${e.regular_amount.toFixed(2)}`
		};
		subTotal = subTotal + e.regular_amount;
		totalTime = totalTime + parseFloat(e.regular_hour);
		employeesData.push(employee);
	});
	const headerData = {
		date: moment(new Date()).format('DD/ MM/ YYYY'),
		invoiceNo: cryptoRandomString({length: 6}),
		totalTime: totalTime,
		amount: subTotal.toFixed(2)
	};

	const document = {
		html: html,
		data: {
			headerData: headerData,
			jobDetails: jobDetails,
			employeesData: employeesData,
			subTotal: subTotal.toFixed(2)
		},
		path: "./report.pdf"
	};

	pdf.create(document, options)
		.then(res => {
			console.log(res)
		})
		.catch(error => {
			console.error(error)
		});
	return { "message": "Report Generated, please check 'report.pdf' file." };
}