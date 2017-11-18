'use strict';

function MSSQLAtt () {

	this.getData = function (cb, limitData="currentMonth") {
        const sql = require('mssql')
        
        var strWhere = `cast(dateadd(day,21,dateadd(day,-day(dateadd(month,-1,getdate())),dateadd(month,-1,getdate()))) as date)
                            ,cast(DATEADD(s,-1,DATEADD(mm, DATEDIFF(m,0,GETDATE())+1,0)) as date)`
        // var strWhere = "'2017-01-01','2017-12-31'";
        var sqlCommand = `Select
                                    MaNV,
                					cast(cast(thoigian as date) as SMALLDATETIME) as Ngay, 
                					cast(cast(thoigian as time) as smalldatetime) as Gio,
                					MayChamCong,
                					DATENAME(month,
                									DateAdd( month , case when day(cast(thoigian as date))<=20 then month(cast(thoigian as date)) else month(cast(thoigian as date))+1 end, -1 )
                							) as Month,
                					case when 
                						day(cast(thoigian as date))>20 and month(cast(thoigian as date))=12 
                					then 
                						year(cast(thoigian as date))+1
                					else 
                						year(cast(thoigian as date)) end as year
            			from dbo.fn_TKM_KDN_DC_0001_DanhSachTrangThaiChamCong
                            (` + strWhere + `)
                            order by MaNV,thoigian;`
        const config = {
            user: 'att',
            password: '\$Rgh789',
            server: '172.16.10.200', // You can use 'localhost\\instance' to connect to named instance
            database: 'BZ_ATT',
            options: {
                encrypt: false,// Use this if you're on Windows Azure
                instanceName: 'sqlexpress2008r2',
                parseJSON: false
            }
        }
        
        const poolmssqlatt = new sql.ConnectionPool(config, err => {
            poolmssqlatt.request() // or: new sql.Request(pool1)
            .query(sqlCommand, (err, result) => {
                if (err===null)
                    cb(result.recordset, err);
                else
                    cb({}, err);
            })
        
        })
        
        poolmssqlatt.on('error', err => {
            cb({}, err)
        })
	}
};

module.exports = MSSQLAtt