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

    var data = {"OkPercent": 55.88353703856635, "KoPercent": 44.11646296143365};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.08805113111726685, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2957166392092257, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.20556470803587773, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.011397720455908818, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.20208676551345414, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.12602965403624383, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.2963294538943599, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.19623992837958817, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.11745747538048344, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.012760743529974299, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.19776186213070726, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.01301634472511144, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.012722265461294378, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.012760743529974299, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.013561847988077497, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.2056910569105691, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.3056910569105691, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.01301634472511144, 500, 1500, "01 Login"], "isController": true}, {"data": [0.12574525745257453, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.20596205962059622, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.011397720455908818, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.18980537534754402, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.1934512951477563, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.013561847988077497, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.11346224005837285, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.19910616563298067, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.2925939438161255, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.28646895273401296, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.012722265461294378, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.1118628359592215, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.19036144578313252, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 193744, 85473, 44.11646296143365, 1556.1287420513756, 1, 13289, 2613.5, 5885.9000000000015, 7242.0, 10110.94000000001, 320.5527410383087, 38315.62048368564, 42.78151328794304], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 5463, 0, 0.0, 1818.1832326560507, 12, 8511, 1597.0, 3430.800000000001, 4238.0, 5539.959999999996, 9.105015175025292, 14.40441853861423, 1.3337424572790955], "isController": false}, {"data": ["GET /inventory-item.html-3", 5463, 1445, 26.45066813106352, 1438.6749038989592, 2, 8825, 1063.0, 3342.4000000000015, 3913.8, 5003.439999999999, 9.06964350639756, 191.06547558766738, 1.0162336948130537], "isController": false}, {"data": ["05 Checkout Step One", 16670, 12849, 77.07858428314337, 1359.1058188362413, 1, 12764, 133.0, 5125.9, 6144.349999999997, 8417.930000000015, 27.672045589985608, 3760.4466248523645, 4.269679358782928], "isController": true}, {"data": ["GET /inventory-item.html-1", 5463, 1398, 25.59033498077979, 1471.8535603148498, 1, 8774, 1092.0, 3371.6000000000004, 3894.800000000002, 4982.679999999996, 9.069071362286408, 106.68701770496301, 0.9357946466664565], "isController": false}, {"data": ["GET /inventory-item.html-2", 5463, 1411, 25.828299469156143, 1998.0162914149748, 3, 9697, 2009.0, 4315.6, 4900.8, 5959.799999999998, 9.06437648604836, 3466.602976734788, 1.0176722053165066], "isController": false}, {"data": ["GET / (login)-0", 5585, 0, 0.0, 1783.2234556848705, 8, 7843, 1605.0, 3327.400000000006, 4054.7, 5202.240000000005, 9.285151405324706, 14.6893996842051, 1.1878465176733755], "isController": false}, {"data": ["GET / (login)-1", 5585, 1384, 24.78066248880931, 1516.2035810205884, 5, 10147, 1184.0, 3411.4000000000005, 3965.0, 5039.240000000005, 9.249292019276949, 109.74659446005083, 0.9647757595266879], "isController": false}, {"data": ["GET / (login)-2", 5585, 1398, 25.0313339301701, 2054.659982094895, 4, 10100, 2131.0, 4326.0, 4902.099999999999, 5884.14, 9.246933693607778, 3574.1737218385542, 1.0493231841613353], "isController": false}, {"data": ["03 Inventory Item (product details)", 16731, 12869, 76.91709999402308, 1353.1626322395507, 1, 12694, 133.0, 5108.800000000001, 6106.4, 8759.760000000002, 27.75653351073448, 3821.410576913705, 4.295788233044725], "isController": true}, {"data": ["GET / (login)-3", 5585, 1445, 25.87287376902417, 1484.4401074306186, 4, 8794, 1116.0, 3390.4000000000005, 3941.5999999999985, 5019.280000000001, 9.249337972631235, 196.20553116310631, 1.0445096443186541], "isController": false}, {"data": ["GET / (login)", 16825, 12840, 76.3150074294205, 1380.8941456166517, 1, 12732, 137.0, 5142.4, 6191.699999999999, 8177.180000000011, 27.837616934536513, 3935.214143026925, 4.238143393302096], "isController": false}, {"data": ["04 Cart", 16703, 12816, 76.72873136562295, 1377.8514638088927, 3, 13289, 134.0, 5084.6, 6126.799999999999, 8608.55999999999, 27.71449572825425, 3824.70680358888, 4.227278104523786], "isController": true}, {"data": ["GET /inventory-item.html", 16731, 12869, 76.91709999402308, 1353.1621540852261, 1, 12694, 133.0, 5108.800000000001, 6106.4, 8759.760000000002, 27.75657955857566, 3821.4169165997196, 4.295795359719033], "isController": false}, {"data": ["GET /inventory.html", 16775, 12875, 76.75111773472429, 1354.2035171386103, 2, 12987, 135.0, 5057.0, 6107.199999999999, 8406.640000000018, 27.813794315540243, 3873.546979573752, 4.310505015705881], "isController": false}, {"data": ["GET /inventory.html-3", 5535, 1445, 26.106594399277327, 1438.7510388437174, 1, 8682, 1073.0, 3315.0, 3903.0, 4948.64, 9.18045947080083, 194.1999080165854, 1.0334625467108745], "isController": false}, {"data": ["GET /inventory.html-0", 5535, 0, 0.0, 1776.545799457993, 19, 7644, 1544.0, 3413.800000000001, 4191.999999999999, 5256.560000000001, 9.221741651283214, 14.589083471756647, 1.3058130267930332], "isController": false}, {"data": ["01 Login", 16825, 12840, 76.3150074294205, 1380.8944427934707, 1, 12732, 137.0, 5142.4, 6191.699999999999, 8177.180000000011, 27.814468813905084, 3931.9418510089877, 4.234619203183661], "isController": true}, {"data": ["GET /inventory.html-2", 5535, 1425, 25.745257452574524, 2002.932610659445, 1, 9785, 2023.0, 4345.400000000001, 4930.2, 5833.240000000013, 9.178069471436057, 3513.9832434811456, 1.0315903689550765], "isController": false}, {"data": ["GET /inventory.html-1", 5535, 1419, 25.636856368563684, 1453.1111111111115, 1, 9449, 1088.0, 3331.600000000002, 3914.7999999999993, 4926.280000000001, 9.180429017121874, 107.94238665290432, 0.9466928686228361], "isController": false}, {"data": ["GET /checkout-step-one.html", 16670, 12849, 77.07858428314337, 1359.1055788842318, 1, 12764, 133.0, 5125.9, 6144.349999999997, 8417.930000000015, 27.672045589985608, 3760.4466248523645, 4.269679358782928], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 5395, 1422, 26.357738646895275, 1482.978683966641, 2, 8983, 1159.0, 3379.4000000000005, 3928.5999999999985, 4913.44, 8.959159848350236, 188.94690833737423, 1.0051226113750609], "isController": false}, {"data": ["GET /cart.html-3", 5482, 1442, 26.30426851514046, 1472.2931411893464, 4, 8495, 1137.5, 3348.7, 3957.699999999999, 5051.910000000002, 9.099857742099871, 192.03874202548607, 1.0216486810850112], "isController": false}, {"data": ["02 Inventory (product search)", 16775, 12875, 76.75111773472429, 1354.2036363636475, 2, 12987, 135.0, 5057.0, 6107.199999999999, 8406.640000000018, 27.813748198945813, 3873.540557048547, 4.31049786868346], "isController": true}, {"data": ["GET /cart.html-2", 5482, 1429, 26.06712878511492, 2041.5981393651916, 4, 8801, 2125.0, 4329.499999999999, 4868.249999999997, 6080.530000000001, 9.09748682341383, 3468.1295081889, 1.018100731080646], "isController": false}, {"data": ["GET /cart.html-1", 5482, 1377, 25.11856986501277, 1491.6260488872663, 4, 8558, 1165.5, 3371.7, 3994.0999999999967, 5034.0, 9.099857742099871, 107.58305084319345, 0.944924525087687], "isController": false}, {"data": ["GET /cart.html-0", 5482, 0, 0.0, 1820.5404961692816, 12, 9294, 1592.0, 3415.0, 4256.699999999999, 5679.34, 9.138143999946658, 14.45682937491561, 1.2493556249927071], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 5395, 0, 0.0, 1827.3829471733125, 11, 8992, 1624.0, 3443.4000000000005, 4207.2, 5587.4, 8.999090916672921, 14.236843051767709, 1.3445907326669502], "isController": false}, {"data": ["GET /cart.html", 16703, 12816, 76.72873136562295, 1377.85116446147, 3, 13289, 134.0, 5084.6, 6126.799999999999, 8608.55999999999, 27.714725656903546, 3824.738534625155, 4.227313175425103], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 5395, 1413, 26.19091751621872, 2048.10231696015, 1, 9775, 2147.0, 4324.400000000001, 4863.2, 5892.0, 8.95689897049619, 3408.855945785028, 1.000689225697252], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 5395, 1371, 25.41241890639481, 1495.1438368860008, 1, 10133, 1188.0, 3353.4000000000005, 3931.3999999999996, 4896.08, 8.959204482425346, 105.5914094052342, 0.9266684131164746], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 74514, 87.17840721631393, 38.46002972995293], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 2954, 3.4560621482807434, 1.5246923775704022], "isController": false}, {"data": ["Assertion failed", 8005, 9.365530635405333, 4.131740853910315], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 193744, 85473, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 74514, "Assertion failed", 8005, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 2954, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 5463, 1445, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1355, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 90, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html-1", 5463, 1398, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1306, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 92, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 5463, 1411, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1320, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 91, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 5585, 1384, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1288, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 96, "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 5585, 1398, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1311, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 87, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-3", 5585, 1445, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1351, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 94, "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 16825, 12840, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 10909, "Assertion failed", 1600, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 331, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html", 16731, 12869, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 10931, "Assertion failed", 1601, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 337, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html", 16775, 12875, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 10910, "Assertion failed", 1635, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 330, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 5535, 1445, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1354, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 91, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory.html-2", 5535, 1425, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1344, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 81, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 5535, 1419, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1328, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 91, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 16670, 12849, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 10959, "Assertion failed", 1574, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 316, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 5395, 1422, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1337, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 85, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 5482, 1442, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1353, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 89, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html-2", 5482, 1429, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1347, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 82, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 5482, 1377, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1293, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 84, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 16703, 12816, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 10903, "Assertion failed", 1595, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 318, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 5395, 1413, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1329, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 84, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 5395, 1371, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1286, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 85, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
