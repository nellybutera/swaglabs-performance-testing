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

    var data = {"OkPercent": 69.78937829525483, "KoPercent": 30.21062170474517};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.17476938032597006, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4139126886984904, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.2609139126886985, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.05680611594818433, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.266421868625051, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.189718482252142, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.4327073552425665, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.297339593114241, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.21165884194053208, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.06498344370860927, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.2934272300469484, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.07105048859934854, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.06392312513056193, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.060079133694294046, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.06367195549144859, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.2690129449838188, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.4267799352750809, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.07649555375909459, 500, 1500, "01 Login"], "isController": true}, {"data": [0.2008495145631068, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.27326051779935273, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.0503319768687085, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.2465963987703118, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.25010482180293503, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.06904664484451718, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.17756813417190775, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.2557651991614256, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.40125786163522015, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.4003074220465525, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.05462806424344886, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.17632850241545894, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.25186649099692576, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 72832, 22003, 30.21062170474517, 1824.7113082161795, 0, 12744, 132.0, 939.0, 1241.0, 2080.0, 242.7118463322625, 36301.443302332154, 39.9522387922143], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 2451, 0, 0.0, 1624.7682578539357, 4, 6210, 1248.0, 3602.6000000000004, 4139.4, 5521.160000000001, 8.289983697380082, 13.11501327124583, 1.2143530806709102], "isController": false}, {"data": ["GET /inventory-item.html-3", 2451, 516, 21.05263157894737, 1605.59037127703, 2, 6325, 1102.0, 3895.6000000000013, 4480.8, 5608.000000000002, 8.271602855069773, 185.53251897263047, 0.9948371032516072], "isController": false}, {"data": ["05 Checkout Step One", 4709, 2920, 62.00891909110214, 1926.4631556593818, 0, 12070, 135.0, 7088.0, 8105.0, 9550.399999999976, 15.967258473599262, 3405.5567875153433, 3.818400567873564], "isController": true}, {"data": ["GET /inventory-item.html-1", 2451, 495, 20.195838433292533, 1610.8355773153776, 2, 6251, 1122.0, 3914.4000000000005, 4468.800000000001, 5571.120000000001, 8.272468307434758, 102.87889691562825, 0.9154803752480728], "isController": false}, {"data": ["GET /inventory-item.html-2", 2451, 501, 20.4406364749082, 2214.736842105261, 2, 7967, 2015.0, 4978.400000000001, 5494.800000000001, 6954.040000000001, 8.265967887170046, 3389.3907879860176, 0.995443821517822], "isController": false}, {"data": ["GET / (login)-0", 2556, 0, 0.0, 1572.7812989045378, 4, 6355, 1142.5, 3550.9000000000005, 4062.650000000001, 5390.499999999992, 8.545008391224984, 13.518470306430151, 1.09316025317429], "isController": false}, {"data": ["GET / (login)-1", 2556, 468, 18.309859154929576, 1558.1396713614993, 2, 6454, 1023.0, 3870.3, 4482.450000000001, 5622.009999999998, 8.53015087954666, 108.10214741479862, 0.9663061543236452], "isController": false}, {"data": ["GET / (login)-2", 2556, 484, 18.9358372456964, 2149.6987480438165, 2, 7833, 1686.5, 5044.000000000002, 5527.0, 6766.169999999996, 8.524148418897196, 3560.9762897109927, 1.0459517381792474], "isController": false}, {"data": ["03 Inventory Item (product details)", 4832, 2881, 59.62334437086093, 1975.8213990066254, 0, 12259, 167.0, 6950.0, 7899.149999999995, 9597.36, 16.227017043069434, 3693.363323555957, 4.097813995466376], "isController": true}, {"data": ["GET / (login)-3", 2556, 485, 18.974960876369327, 1559.4143192488245, 2, 6415, 1024.5, 3880.0, 4541.450000000001, 5600.579999999999, 8.531147365891432, 195.84886491265252, 1.053055680255534], "isController": false}, {"data": ["GET / (login)", 4912, 2869, 58.40798045602606, 1967.007328990223, 2, 12701, 221.5, 7085.7, 7893.699999999999, 9625.60999999999, 16.369186472760234, 3893.4864658505257, 4.151187949052907], "isController": false}, {"data": ["04 Cart", 4787, 2905, 60.68518905368707, 1978.4242740756274, 0, 12323, 161.0, 7088.799999999999, 7951.199999999999, 9922.32, 16.144916391794997, 3545.8821242405193, 3.886455392796676], "isController": true}, {"data": ["GET /inventory-item.html", 4802, 2881, 59.99583506872137, 1983.5220741357798, 1, 12259, 176.0, 6952.4, 7905.849999999999, 9599.760000000002, 16.194086224572384, 3708.895158878335, 4.1150466819322284], "isController": false}, {"data": ["GET /inventory.html", 4853, 2915, 60.0659385946837, 1957.8485472903476, 2, 12744, 172.0, 7021.0, 7994.200000000003, 9832.5, 16.29376452102443, 3729.961664993881, 4.104887830332322], "isController": false}, {"data": ["GET /inventory.html-3", 2472, 503, 20.34789644012945, 1579.807038834949, 3, 6149, 1005.5, 3863.3000000000025, 4534.049999999999, 5716.62, 8.306200417326089, 187.7950468357812, 1.0079159022408597], "isController": false}, {"data": ["GET /inventory.html-0", 2472, 0, 0.0, 1569.3766181229769, 6, 6171, 1200.5, 3503.0, 4081.7499999999995, 5365.86, 8.326232009511843, 13.172359233798037, 1.1790074622843922], "isController": false}, {"data": ["01 Login", 4948, 2869, 57.98302344381568, 1960.0887227162427, 0, 12701, 204.5, 7078.1, 7889.300000000001, 9588.530000000022, 16.390564493956226, 3870.2066202462647, 4.126367260609313], "isController": true}, {"data": ["GET /inventory.html-2", 2472, 503, 20.34789644012945, 2212.8851132686177, 3, 7739, 1804.0, 5141.400000000001, 5601.199999999999, 6847.59, 8.299953329550453, 3407.2717423648483, 1.0007017093052146], "isController": false}, {"data": ["GET /inventory.html-1", 2472, 492, 19.902912621359224, 1591.1274271844632, 3, 6218, 1021.5, 3838.2000000000016, 4527.7, 5678.8099999999995, 8.305977145122759, 103.60144012165803, 0.9225625972306689], "isController": false}, {"data": ["GET /checkout-step-one.html", 4669, 2920, 62.54015849218248, 1935.8487898907754, 2, 12070, 144.0, 7107.0, 8115.5, 9563.000000000004, 15.92901031342861, 3426.5050869353286, 3.8418883566235547], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2277, 508, 22.310057092665787, 1630.75406236276, 3, 6130, 1107.0, 3950.2000000000003, 4644.2, 5727.66, 7.774488614829914, 171.91526539362405, 0.9201556050068117], "isController": false}, {"data": ["GET /cart.html-3", 2385, 519, 21.761006289308177, 1651.1530398322845, 3, 6342, 1067.0, 4083.8000000000006, 4796.199999999999, 5645.98, 8.092042316122335, 180.05448212413566, 0.9645084635637559], "isController": false}, {"data": ["02 Inventory (product search)", 4888, 2915, 59.63584288052373, 1950.4212356792245, 0, 12744, 159.0, 7003.600000000002, 7982.300000000001, 9823.749999999993, 16.353021863133772, 3716.7217080625537, 4.090317026939998], "isController": true}, {"data": ["GET /cart.html-2", 2385, 523, 21.928721174004192, 2258.078406708594, 3, 7977, 1963.0, 5160.200000000001, 5675.999999999996, 6983.139999999999, 8.085759908869926, 3253.856326497942, 0.9555290091469099], "isController": false}, {"data": ["GET /cart.html-1", 2385, 509, 21.341719077568133, 1652.0272536687564, 3, 6293, 1086.0, 4054.8000000000006, 4787.799999999999, 5679.6799999999985, 8.091795224992621, 99.4703038961061, 0.8826280437533716], "isController": false}, {"data": ["GET /cart.html-0", 2385, 0, 0.0, 1640.6238993710722, 4, 6234, 1259.0, 3568.4, 4052.7, 5483.98, 8.109596866329362, 12.829635667435124, 1.1087339465684674], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 2277, 0, 0.0, 1656.9222661396586, 5, 6134, 1332.0, 3567.800000000001, 4115.599999999999, 5698.0999999999985, 7.792554465746298, 12.328064682137699, 1.1643172199796716], "isController": false}, {"data": ["GET /cart.html", 4732, 2905, 61.3905325443787, 1993.7643702451444, 2, 12323, 176.5, 7108.499999999999, 7966.399999999998, 9928.37, 16.040732341465564, 3563.94815440582, 3.906256620785155], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2277, 498, 21.870882740447957, 2258.017566974088, 3, 7757, 1983.0, 5166.6, 5659.1, 6750.44, 7.768600116682531, 3128.5333075638086, 0.9187290016222965], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2277, 495, 21.73913043478261, 1618.2059727711928, 3, 6205, 1090.0, 3934.4000000000005, 4578.4, 5705.939999999995, 7.774541704936168, 95.18988110277623, 0.8437384764698049], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 19057, 86.6109166931782, 26.16569639718805], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 269, 1.2225605599236469, 0.36934314586994726], "isController": false}, {"data": ["Assertion failed", 2677, 12.166522746898151, 3.6755821616871707], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 72832, 22003, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 19057, "Assertion failed", 2677, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 269, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 2451, 516, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 505, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 11, "", "", "", "", "", ""], "isController": false}, {"data": ["05 Checkout Step One", 61, 3, "Assertion failed", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-1", 2451, 495, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 483, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 12, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 2451, 501, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 489, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 12, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 2556, 468, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 453, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 15, "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 2556, 484, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 468, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 16, "", "", "", "", "", ""], "isController": false}, {"data": ["03 Inventory Item (product details)", 45, 2, "Assertion failed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-3", 2556, 485, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 468, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 17, "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 4912, 2869, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2348, "Assertion failed", 513, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 8, "", "", "", ""], "isController": false}, {"data": ["04 Cart", 78, 5, "Assertion failed", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html", 4802, 2881, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2341, "Assertion failed", 530, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 10, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html", 4853, 2915, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2367, "Assertion failed", 534, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 14, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 2472, 503, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 488, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 15, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["01 Login", 60, 2, "Assertion failed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-2", 2472, 503, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 489, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 14, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 2472, 492, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 479, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 13, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 4669, 2920, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2384, "Assertion failed", 528, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 8, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2277, 508, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 489, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 19, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 2385, 519, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 507, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 12, "", "", "", "", "", ""], "isController": false}, {"data": ["02 Inventory (product search)", 56, 2, "Assertion failed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-2", 2385, 523, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 508, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 15, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 2385, 509, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 497, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 12, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 4732, 2905, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2339, "Assertion failed", 558, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 8, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2277, 498, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 478, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 20, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2277, 495, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 477, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 18, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
