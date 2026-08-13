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

    var data = {"OkPercent": 37.1367597586701, "KoPercent": 62.8632402413299};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.09453818341185494, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.503940110323089, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.45724980299448387, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.01454954954954955, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.4582348305752561, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.33077226162332546, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.5128156803618545, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.4651338107802488, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.35243120995099886, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.015978456014362655, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.45947983415001886, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.017837982832618025, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.015582137878310923, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.015978456014362655, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.017334049986562752, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.46689761354888376, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.5026943802925328, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.017837982832618025, 500, 1500, "01 Login"], "isController": true}, {"data": [0.3489222478829869, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.46150885296381833, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.01454954954954955, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.4380333197887038, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.45114136964357227, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.017334049986562752, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.3227873448137765, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.45074088906688026, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.4883860632759311, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.49695245835026414, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.015582137878310923, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.3195855343356359, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.4398618447785453, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 162599, 102215, 62.8632402413299, 721.5106919476827, 1, 12958, 1522.0, 3887.9000000000015, 4461.950000000001, 5914.990000000002, 535.3035874779013, 44956.250092592294, 46.7875774483047], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 2538, 0, 0.0, 1111.4680851063817, 5, 8328, 974.5, 2140.1, 2663.0999999999995, 3913.030000000003, 8.439407844858545, 13.351406942061368, 1.2362413835242008], "isController": false}, {"data": ["GET /inventory-item.html-3", 2538, 158, 6.225374310480693, 1092.6737588652493, 5, 9602, 865.0, 2310.2999999999997, 2832.0499999999997, 3970.9800000000023, 8.37264539966351, 219.27709182116584, 1.1961142908982945], "isController": false}, {"data": ["05 Checkout Step One", 22200, 19926, 89.75675675675676, 508.4276126126119, 1, 12923, 267.0, 462.0, 2881.9500000000007, 4791.980000000003, 73.21972183102075, 4388.380671616762, 4.5678067807399145], "isController": true}, {"data": ["GET /inventory-item.html-1", 2538, 147, 5.791962174940898, 1100.039007092198, 5, 10211, 878.5, 2314.0, 2825.149999999999, 4017.4400000000005, 8.372286346707659, 119.26759555308881, 1.093755927483069], "isController": false}, {"data": ["GET /inventory-item.html-2", 2538, 151, 5.94956658786446, 1451.9499605988963, 7, 9789, 1352.0, 2870.1, 3368.0499999999997, 4415.9100000000035, 8.378283805285779, 4057.49473275342, 1.1927450154905819], "isController": false}, {"data": ["GET / (login)-0", 2653, 0, 0.0, 1074.7651715039574, 8, 7826, 930.0, 2090.2, 2515.2999999999997, 3876.880000000001, 8.811289610117871, 13.939735516006788, 1.127225526294376], "isController": false}, {"data": ["GET / (login)-1", 2653, 190, 7.161703731624576, 1048.13682623445, 3, 8359, 821.0, 2343.6, 2754.399999999998, 3872.1400000000003, 8.741610130119179, 123.04281096371062, 1.1254001869083432], "isController": false}, {"data": ["GET / (login)-2", 2653, 183, 6.897851488880512, 1382.427440633244, 3, 10231, 1250.0, 2828.3999999999996, 3300.199999999999, 4356.92, 8.737694605552207, 4189.120097268811, 1.2313692561102931], "isController": false}, {"data": ["03 Inventory Item (product details)", 22280, 19915, 89.3850987432675, 510.3264362657084, 2, 11327, 267.0, 463.0, 2871.7500000000036, 4773.980000000003, 73.49327246278331, 4557.129909687885, 4.707901841083993], "isController": true}, {"data": ["GET / (login)-3", 2653, 194, 7.312476441764041, 1063.5514511873357, 3, 9945, 821.0, 2339.199999999999, 2763.8999999999965, 3951.1400000000003, 8.741782954676507, 226.54948388614758, 1.2343716534589848], "isController": false}, {"data": ["GET / (login)", 22368, 19928, 89.09155937052932, 509.9215844062935, 1, 10844, 268.0, 465.0, 2854.7500000000036, 4701.880000000019, 73.64217304988823, 4701.159708921558, 4.706134291077208], "isController": false}, {"data": ["04 Cart", 22237, 19940, 89.67036920447902, 505.02608265503494, 1, 12958, 266.0, 461.0, 2854.0, 4728.970000000005, 73.3403033611145, 4433.538396975377, 4.50737109296412], "isController": true}, {"data": ["GET /inventory-item.html", 22280, 19915, 89.3850987432675, 510.32737881508046, 2, 11327, 267.0, 463.0, 2871.7500000000036, 4773.980000000003, 73.49303003714235, 4557.114877493749, 4.707886311552062], "isController": false}, {"data": ["GET /inventory.html", 22326, 19933, 89.28155513750784, 507.7051419869209, 1, 12013, 267.0, 463.0, 2832.9500000000007, 4770.94000000001, 73.58917817836624, 4620.991467271999, 4.7443432655733435], "isController": false}, {"data": ["GET /inventory.html-3", 2598, 174, 6.697459584295612, 1045.067359507312, 4, 9206, 799.5, 2274.2, 2714.0499999999997, 3983.0699999999983, 8.56823421159383, 223.3847917192287, 1.217893856793739], "isController": false}, {"data": ["GET /inventory.html-0", 2598, 0, 0.0, 1106.1901462663577, 4, 7907, 957.5, 2130.7999999999993, 2647.0499999999997, 4032.0199999999995, 8.638978485684833, 13.667133932431083, 1.2232928519768562], "isController": false}, {"data": ["01 Login", 22368, 19928, 89.09155937052932, 509.9206902718155, 1, 10844, 268.0, 465.0, 2854.7500000000036, 4701.880000000019, 73.60243235506066, 4698.622747482338, 4.7035946451252535], "isController": true}, {"data": ["GET /inventory.html-2", 2598, 175, 6.735950731331794, 1396.1816782140108, 5, 10213, 1288.5, 2827.1, 3339.7999999999956, 4569.299999999993, 8.563517700573538, 4112.72049428007, 1.2089217987754632], "isController": false}, {"data": ["GET /inventory.html-1", 2598, 179, 6.88991531947652, 1049.6655119322588, 5, 9090, 810.0, 2289.2, 2725.4999999999973, 3990.1399999999967, 8.567923383373348, 120.88924527020454, 1.1062688495138908], "isController": false}, {"data": ["GET /checkout-step-one.html", 22200, 19926, 89.75675675675676, 508.42819819819715, 1, 12923, 267.0, 462.0, 2881.9500000000007, 4791.980000000003, 73.21972183102075, 4388.380671616762, 4.5678067807399145], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2461, 164, 6.66395774075579, 1119.96627387241, 7, 9119, 895.0, 2358.0, 2884.7000000000003, 3916.1600000000035, 8.121602935789506, 211.7986838799712, 1.1548239343077498], "isController": false}, {"data": ["GET /cart.html-3", 2497, 184, 7.36884261113336, 1086.8894673608345, 6, 9605, 858.0, 2341.600000000001, 2757.1, 4070.7799999999993, 8.239156616567403, 213.41647650875225, 1.1626914812004026], "isController": false}, {"data": ["02 Inventory (product search)", 22326, 19933, 89.28155513750784, 507.70424617038384, 1, 12013, 267.0, 463.0, 2832.9500000000007, 4770.94000000001, 73.58942073793781, 4621.006698665231, 4.744358903550262], "isController": true}, {"data": ["GET /cart.html-2", 2497, 177, 7.088506207448939, 1429.4365238285966, 5, 9404, 1331.0, 2863.4000000000005, 3327.3999999999996, 4423.34, 8.23584124649144, 3940.47387627108, 1.1582682469894816], "isController": false}, {"data": ["GET /cart.html-1", 2497, 177, 7.088506207448939, 1085.782539046857, 5, 9111, 847.0, 2368.4000000000005, 2748.3999999999996, 4070.0, 8.238667295757267, 116.0439104913093, 1.0614872823615973], "isController": false}, {"data": ["GET /cart.html-0", 2497, 0, 0.0, 1122.070484581498, 9, 9121, 997.0, 2157.2000000000003, 2594.4999999999995, 3861.999999999999, 8.306830430211978, 13.141665329046294, 1.135699472880544], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 2461, 0, 0.0, 1136.8362454286896, 8, 8833, 974.0, 2202.000000000001, 2728.3000000000006, 4345.7400000000025, 8.188593864377454, 12.954611387003393, 1.2234910754392094], "isController": false}, {"data": ["GET /cart.html", 22237, 19940, 89.67036920447902, 505.02707199712256, 1, 12958, 266.0, 461.0, 2854.0, 4728.970000000005, 73.34006147676152, 4433.523774680166, 4.507356227160591], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2461, 166, 6.745225518082081, 1464.5123933360426, 5, 9593, 1395.0, 2901.0, 3392.4000000000005, 4369.660000000001, 8.117102646221637, 3897.9187626726657, 1.1457869081210605], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2461, 154, 6.25761885412434, 1132.4392523364472, 8, 9121, 920.0, 2381.000000000001, 2898.2000000000007, 4011.5000000000027, 8.121040126715945, 115.20793717413542, 1.0556890695122756], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 99187, 97.03761678814264, 61.00099016599118], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 2047, 2.0026414909749057, 1.258925331644106], "isController": false}, {"data": ["Assertion failed", 978, 0.9568067309103361, 0.6014797138973794], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, 0.0029349899721175954, 0.0018450297972312252], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 162599, 102215, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 99187, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 2047, "Assertion failed", 978, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 2538, 158, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 110, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 48, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html-1", 2538, 147, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 46, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 2538, 151, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 110, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 41, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 2653, 190, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 126, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 64, "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 2653, 183, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 122, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 59, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 2, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-3", 2653, 194, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 132, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 62, "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 22368, 19928, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 19474, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 241, "Assertion failed", 213, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html", 22280, 19915, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 19497, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 245, "Assertion failed", 173, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html", 22326, 19933, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 19487, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 241, "Assertion failed", 205, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 2598, 174, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 115, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 59, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory.html-2", 2598, 175, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 112, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 63, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 2598, 179, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 117, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 62, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 22200, 19926, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 19487, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 252, "Assertion failed", 187, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2461, 164, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 119, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 45, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 2497, 184, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 115, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 69, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html-2", 2497, 177, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 117, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 60, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 2497, 177, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 112, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 65, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 22237, 19940, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 19493, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 247, "Assertion failed", 200, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2461, 166, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 127, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 39, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2461, 154, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 115, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 39, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
