/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 42.691163662059786, "KoPercent": 57.308836337940214};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.12902305694172903, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5291073738680466, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.2508085381630013, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.03798715203426124, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.25630659767141006, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.20213454075032342, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.5372766481823783, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.27341343191620454, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.20856438693776957, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.04103125789872778, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.2609365372766482, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.03660371051312051, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.037373651575639176, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.03337863088160353, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.03349060577976241, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.24599434495758718, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.5353440150801131, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.04482558621261082, 500, 1500, "01 Login"], "isController": true}, {"data": [0.1988689915174364, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.25322023248507697, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.029256698357821954, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.22562997347480107, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.23491803278688525, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.04124529878813205, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.1839344262295082, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.2422950819672131, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.5103278688524591, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.5223806366047745, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.029293361884368308, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.1802055702917772, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.23159814323607428, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 121702, 69746, 57.308836337940214, 1010.538191648465, 0, 18331, 23.0, 448.0, 602.0, 1008.0, 406.8396068730361, 34678.37838914263, 41.56623662311125], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 3092, 0, 0.0, 1400.1076972833093, 4, 10903, 771.5, 3444.4000000000005, 4636.35, 6569.260000000003, 10.463443934958798, 16.553495287727788, 1.5327310451599805], "isController": false}, {"data": ["GET /inventory-item.html-3", 3092, 1263, 40.847347994825355, 1101.3224450194043, 2, 9637, 288.0, 3562.0, 4511.899999999999, 5750.890000000005, 10.463302302129547, 182.35620705503047, 0.9429043404769397], "isController": false}, {"data": ["05 Checkout Step One", 11675, 9960, 85.31049250535332, 773.1210278372561, 0, 17462, 13.0, 2569.999999999998, 5692.79999999999, 10031.839999999997, 39.699811617167995, 3365.329533408199, 4.122518203893812], "isController": true}, {"data": ["GET /inventory-item.html-1", 3092, 1248, 40.36222509702458, 1103.434346701163, 2, 9576, 293.0, 3550.0, 4511.0, 5812.630000000001, 10.463266894521336, 103.80417210394742, 0.8653207590267673], "isController": false}, {"data": ["GET /inventory-item.html-2", 3092, 1260, 40.7503234152652, 1429.2991591203106, 2, 13352, 443.0, 4360.000000000003, 5201.399999999998, 7356.840000000002, 10.462948236830796, 3201.66943051885, 0.9383650036038291], "isController": false}, {"data": ["GET / (login)-0", 3246, 0, 0.0, 1356.3832409118907, 5, 10774, 747.5, 3411.000000000002, 4387.449999999995, 6433.119999999948, 10.880422613580752, 17.213168587891424, 1.391929064823319], "isController": false}, {"data": ["GET / (login)-1", 3246, 1301, 40.08009858287122, 1074.5101663585926, 3, 10305, 285.5, 3499.6000000000004, 4555.449999999995, 6152.029999999987, 10.886297552092241, 108.3954276334544, 0.9045647891492523], "isController": false}, {"data": ["GET / (login)-2", 3246, 1335, 41.1275415896488, 1392.2624768946396, 3, 12551, 442.5, 4320.500000000001, 5284.999999999985, 7440.649999999999, 10.886188023180939, 3310.152920511921, 0.9701072363721427], "isController": false}, {"data": ["03 Inventory Item (product details)", 11869, 10040, 84.59010868649423, 780.2580672339695, 0, 16948, 13.0, 2579.0, 5734.5, 9946.699999999993, 39.96834590517241, 3555.372678822485, 4.2584254823882], "isController": true}, {"data": ["GET / (login)-3", 3246, 1342, 41.34319162045595, 1071.5428219346902, 3, 10369, 281.0, 3476.600000000002, 4514.249999999998, 6150.839999999993, 10.886881743510969, 188.3809556238408, 0.9728515513638788], "isController": false}, {"data": ["GET / (login)", 11966, 10166, 84.95737924118335, 786.8533344476036, 1, 17694, 14.0, 2561.0, 5774.899999999998, 9746.559999999998, 40.00989714988832, 3681.036661929158, 4.227359459844655], "isController": false}, {"data": ["04 Cart", 11773, 10017, 85.08451541663128, 772.520343158074, 0, 18331, 13.0, 2629.6000000000004, 5734.299999999992, 9175.52, 39.8564585202363, 3465.197062731689, 4.08002347571813], "isController": true}, {"data": ["GET /inventory-item.html", 11774, 10040, 85.27263461865127, 786.4081875318482, 1, 16948, 13.0, 2604.0, 5790.25, 9955.0, 39.8405565631683, 3572.600466633026, 4.279059957939688], "isController": false}, {"data": ["GET /inventory.html", 11869, 10139, 85.424214339877, 763.7699047940006, 1, 17706, 13.0, 2628.0, 5710.5, 9093.99999999997, 39.96565425281164, 3592.5333710919085, 4.277552886558017], "isController": false}, {"data": ["GET /inventory.html-3", 3183, 1346, 42.287150486961984, 1033.8256361922765, 3, 9605, 240.0, 3354.2, 4293.999999999998, 5362.48, 10.71829046129394, 182.8987957023713, 0.9423726676858527], "isController": false}, {"data": ["GET /inventory.html-0", 3183, 0, 0.0, 1349.4366949418759, 4, 9811, 739.0, 3399.599999999999, 4386.599999999995, 5827.439999999999, 10.718507019392987, 16.957013058024064, 1.5177573416132648], "isController": false}, {"data": ["01 Login", 12069, 10166, 84.23233076476924, 780.2679592344042, 0, 17694, 13.0, 2542.0, 5744.5, 9717.799999999981, 40.16145777872431, 3663.4467864947987, 4.207158974724803], "isController": true}, {"data": ["GET /inventory.html-2", 3183, 1332, 41.84731385485391, 1354.1853597235297, 3, 12521, 411.0, 4215.0, 4845.799999999996, 7244.919999999998, 10.718182185525908, 3219.534756748953, 0.9434581848204545], "isController": false}, {"data": ["GET /inventory.html-1", 3183, 1311, 41.1875589066918, 1049.9937166195446, 2, 10362, 261.0, 3357.7999999999993, 4321.199999999999, 5357.799999999999, 10.718507019392987, 105.23071529533982, 0.8741619326313378], "isController": false}, {"data": ["GET /checkout-step-one.html", 11570, 9960, 86.0847018150389, 779.9713915298154, 1, 17462, 13.0, 2592.699999999999, 5705.0, 10050.669999999978, 39.495198790224855, 3378.368236724561, 4.138490574873612], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 3016, 1300, 43.10344827586207, 1098.8362068965546, 2, 10980, 269.5, 3489.4000000000015, 4401.0, 5933.639999999999, 10.327246330163709, 174.09173464502658, 0.8951485740113613], "isController": false}, {"data": ["GET /cart.html-3", 3050, 1281, 42.0, 1092.6645901639315, 2, 11000, 311.5, 3421.5000000000005, 4444.499999999998, 5820.409999999998, 10.3915041787475, 178.09762514735493, 0.9181868145440173], "isController": false}, {"data": ["02 Inventory (product search)", 11965, 10139, 84.73882156289177, 757.6418721270368, 0, 17706, 13.0, 2606.199999999999, 5657.699999999999, 9058.900000000005, 40.127576515725714, 3578.1475264338105, 4.260423968052211], "isController": true}, {"data": ["GET /cart.html-2", 3050, 1276, 41.83606557377049, 1427.2963934426223, 1, 13258, 483.5, 4305.9, 5028.349999999999, 7577.639999999992, 10.391327159862904, 3121.9699559422634, 0.9148639949883139], "isController": false}, {"data": ["GET /cart.html-1", 3050, 1246, 40.85245901639344, 1090.7150819672106, 3, 10119, 318.5, 3421.6000000000004, 4428.349999999999, 5773.53999999999, 10.391610392973227, 102.47013556579765, 0.8523303186306244], "isController": false}, {"data": ["GET /cart.html-0", 3050, 0, 0.0, 1395.1009836065596, 4, 10496, 798.5, 3404.8, 4349.5499999999965, 5945.859999999997, 10.391043942191727, 16.438956236670506, 1.4206505389715252], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 3016, 0, 0.0, 1406.2877984084905, 4, 10927, 790.5, 3513.300000000004, 4554.050000000001, 6649.4899999999925, 10.323958704165184, 16.332825293698825, 1.5425446110715555], "isController": false}, {"data": ["GET /cart.html", 11675, 10017, 85.79871520342613, 779.0048822269811, 1, 18331, 13.0, 2660.0, 5775.799999999996, 9187.79999999999, 39.686046827835646, 3479.3436569459927, 4.096680085847632], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 3016, 1303, 43.20291777188329, 1424.414124668433, 2, 12931, 433.0, 4356.3, 5282.950000000004, 7626.519999999997, 10.32721096821027, 3030.382434881388, 0.8878524886232897], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 3016, 1278, 42.37400530503979, 1097.1226790450955, 3, 10089, 285.0, 3504.3, 4387.450000000001, 5844.66, 10.327246330163709, 99.86814602216111, 0.8252610702875947], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 58899, 84.44785364035214, 48.39608223365269], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 3762, 5.393857712270238, 3.091157088626317], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException", 2, 0.0028675479597396266, 0.0016433583671591264], "isController": false}, {"data": ["Assertion failed", 7055, 10.115275427981533, 5.796946640153818], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 28, 0.04014567143635477, 0.023007017140227768], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 121702, 69746, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 58899, "Assertion failed", 7055, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 3762, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 28, "Non HTTP response code: java.net.BindException", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 3092, 1263, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1130, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 133, "", "", "", "", "", ""], "isController": false}, {"data": ["05 Checkout Step One", 106, 1, "Non HTTP response code: java.net.BindException", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-1", 3092, 1248, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1111, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 137, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 3092, 1260, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1124, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 136, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 3246, 1301, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1148, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 150, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 3246, 1335, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1182, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 151, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 2, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-3", 3246, 1342, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1193, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 146, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 11966, 10166, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 8398, "Assertion failed", 1446, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 321, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html", 11774, 10040, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 8347, "Assertion failed", 1358, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 332, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", ""], "isController": false}, {"data": ["GET /inventory.html", 11869, 10139, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 8369, "Assertion failed", 1453, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 317, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 3183, 1346, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1202, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 144, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["01 Login", 104, 1, "Non HTTP response code: java.net.BindException", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-2", 3183, 1332, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1190, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 142, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 3183, 1311, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1167, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 144, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 11570, 9960, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 8219, "Assertion failed", 1406, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 332, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 3016, 1300, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1163, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 134, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 3050, 1281, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1124, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 157, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html-2", 3050, 1276, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1123, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 153, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 3050, 1246, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1096, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 149, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 11675, 10017, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 8328, "Assertion failed", 1392, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 294, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 3016, 1303, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1157, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 143, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 3016, 1278, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1128, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 147, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
