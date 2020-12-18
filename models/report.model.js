const sql = require("./db.connection.js");


// constructor
const ReportModel = function() {
	this.job_id = 0;
	this.location = '';
	this.start_date = new Date();
	this.end_date = new Date();
	this.job_title = '';
	this.provider_name = '';
	this.regular_hour = 0;
	this.regular_rate = 0;
	this.regular_amount =0;
};

ReportModel.fetchReportData = (job_id, result) => {
		sql.query(`SELECT jbs.location, jbs.start_date, jbs.end_date, jbs.job_title, CONCAT(usr.first_name, usr.last_name) as user_name,
		FORMAT(aps.approval_hour + (aps.approval_min / 60), 2) as regular_hour,
		jbs.hourly_rate as regular_rate,
		aps.approval_hour + (aps.approval_min / 60) * jbs.hourly_rate as regular_amount
		FROM tab_jobs jbs, 
		tab_approve_seeker aps,
		tab_users usr WHERE jbs.user_id = aps.provider_id AND jbs.user_id = usr.user_id AND jbs.job_id = ${job_id}`, (err, res) => {
		  if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		  }
	  
		  if (res.length) {
			result(null, res);
			return;
		  }
	  
		  result({ kind: "not_found" }, null);
		});
}

module.exports = ReportModel;