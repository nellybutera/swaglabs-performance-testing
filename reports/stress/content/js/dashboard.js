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

    var data = {"OkPercent": 46.02758261774655, "KoPercent": 53.97241738225345};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.045277623052155366, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.12373180414644905, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.1365240405822673, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.004641058556334551, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.1345390383767093, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.107851786501985, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.14601769911504425, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.1696165191740413, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.13253265908133166, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.005372180815022747, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.1710914454277286, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.007650636761072039, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.005520812976353332, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.005372180815022747, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.006810551558752998, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.16615180935569285, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.14276257722859664, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.007650636761072039, 500, 1500, "01 Login"], "isController": true}, {"data": [0.13305383936451898, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.1648278905560459, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.004641058556334551, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.13340174448435094, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.14091122592766558, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.006810551558752998, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.11977454203851573, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.1385627054955378, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.12024424612494129, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.1172396100564392, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.005520812976353332, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.10877373011800924, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.13032324268855824, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 96075, 51854, 53.97241738225345, 3328.666718709309, 1, 26721, 1024.0, 10090.800000000003, 13450.850000000002, 17296.99, 313.9572501821818, 31152.32468231027, 34.44682024844533], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 2267, 0, 0.0, 3877.59947066608, 23, 14033, 3605.0, 7163.6, 8052.2, 9377.6, 7.483231224252668, 11.838705647743478, 1.0961764488651367], "isController": false}, {"data": ["GET /inventory-item.html-3", 2267, 555, 24.481693868548742, 3937.9611821790927, 1, 11309, 3177.0, 9458.2, 10013.0, 10053.32, 7.4389331513250285, 160.9047616288704, 0.8558300628716186], "isController": false}, {"data": ["05 Checkout Step One", 10127, 8718, 86.0866989236694, 2498.3878740001996, 1, 23391, 511.0, 10409.0, 14161.200000000003, 17611.44, 33.26205983689208, 2718.580284092215, 3.0432142016957835], "isController": true}, {"data": ["GET /inventory-item.html-1", 2267, 556, 24.525805028672256, 3909.3828848698713, 2, 11686, 3156.0, 9426.800000000001, 10012.0, 10054.920000000002, 7.436663703373235, 88.95603696886245, 0.7783322391837055], "isController": false}, {"data": ["GET /inventory-item.html-2", 2267, 546, 24.08469342743714, 5351.116012351126, 1, 17879, 4674.0, 10620.4, 12002.599999999999, 15860.840000000002, 7.435127121979376, 2910.401444363431, 0.8543768848145646], "isController": false}, {"data": ["GET / (login)-0", 2373, 0, 0.0, 3684.2739148756777, 6, 14246, 3323.0, 7083.799999999999, 7878.799999999998, 9311.0, 7.808155623484352, 12.35274620121548, 0.9988949088637208], "isController": false}, {"data": ["GET / (login)-1", 2373, 532, 22.4188790560472, 3655.959544879897, 1, 11813, 2660.0, 9360.2, 10011.3, 10063.52, 7.765535160890238, 94.89826730678608, 0.8354410839515546], "isController": false}, {"data": ["GET / (login)-2", 2373, 540, 22.75600505689001, 4933.400758533504, 3, 17786, 3681.0, 10269.8, 11518.099999999999, 15710.579999999993, 7.762131396889259, 3091.2117840043015, 0.9075644135469311], "isController": false}, {"data": ["03 Inventory Item (product details)", 10331, 8650, 83.72858387377795, 2666.2794501984317, 1, 26721, 538.0, 10670.0, 14454.399999999998, 18075.480000000003, 33.87579639764302, 3238.4843457447855, 3.5763314913990696], "isController": true}, {"data": ["GET / (login)-3", 2373, 545, 22.966708807416772, 3644.4643910661653, 2, 11951, 2660.0, 9358.8, 10012.0, 10086.52, 7.767975514346039, 170.96877902658886, 0.9116139090299032], "isController": false}, {"data": ["GET / (login)", 10522, 8715, 82.82645884812773, 2629.8290249002107, 1, 23202, 549.0, 10464.7, 14094.0, 17528.31, 34.38449723865234, 3433.6383034102237, 3.6430590503578317], "isController": false}, {"data": ["04 Cart", 10234, 8712, 85.12800469024819, 2592.0134844635654, 1, 23194, 532.5, 10446.5, 14133.75, 17759.25, 33.592757566904865, 2932.553371743999, 3.208613770478485], "isController": true}, {"data": ["GET /inventory-item.html", 10331, 8650, 83.72858387377795, 2666.283418836511, 1, 26721, 538.0, 10670.0, 14454.399999999998, 18075.480000000003, 33.875685317803836, 3238.4737266491893, 3.576319764491684], "isController": false}, {"data": ["GET /inventory.html", 10425, 8681, 83.27098321342926, 2589.2653237410186, 1, 23083, 536.0, 10457.4, 14170.699999999999, 17752.48, 34.1779746312549, 3326.5305721265913, 3.6216032308021413], "isController": false}, {"data": ["GET /inventory.html-3", 2266, 499, 22.021182700794352, 3777.4395410414845, 5, 10942, 2903.5, 9405.3, 10011.0, 10049.66, 7.434822266406809, 165.39110395401468, 0.883226064039215], "isController": false}, {"data": ["GET /inventory.html-0", 2266, 0, 0.0, 3729.1315092674317, 10, 14215, 3430.0, 6976.9, 7990.750000000002, 9336.559999999998, 7.4740338343508705, 11.824155089500401, 1.0583348691219494], "isController": false}, {"data": ["01 Login", 10522, 8715, 82.82645884812773, 2629.826743965026, 1, 23202, 549.0, 10464.7, 14094.0, 17528.31, 34.34521477999739, 3429.7155543366057, 3.638897049223136], "isController": true}, {"data": ["GET /inventory.html-2", 2266, 497, 21.932921447484553, 5164.9611650485485, 5, 17843, 4233.0, 10465.699999999999, 11795.25, 15425.859999999997, 7.429410761826074, 2990.016646041937, 0.8779181738190318], "isController": false}, {"data": ["GET /inventory.html-1", 2266, 486, 21.44748455428067, 3787.090909090917, 8, 10911, 2936.0, 9357.9, 10011.0, 10048.0, 7.432968792027763, 91.70763967876027, 0.8096751192358409], "isController": false}, {"data": ["GET /checkout-step-one.html", 10127, 8718, 86.0866989236694, 2498.3901451565102, 1, 23391, 511.0, 10409.0, 14161.200000000003, 17611.44, 33.261950588250755, 2718.571354963838, 3.0432042063131033], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 1949, 506, 25.962031811185224, 4108.235505387375, 2, 11110, 3686.0, 9595.0, 10015.0, 10111.0, 6.408675551346676, 136.23967021338686, 0.7228487245124441], "isController": false}, {"data": ["GET /cart.html-3", 2129, 577, 27.101925786754343, 3885.29497416627, 3, 12437, 2956.0, 9665.0, 10014.0, 10061.7, 6.990504209406481, 146.62773494960697, 0.7763350582487294], "isController": false}, {"data": ["02 Inventory (product search)", 10425, 8681, 83.27098321342926, 2589.263597122314, 1, 23083, 536.0, 10457.4, 14170.699999999999, 17752.48, 34.1779746312549, 3326.5305721265913, 3.6216032308021413], "isController": true}, {"data": ["GET /cart.html-2", 2129, 578, 27.1488961953969, 5137.611085016436, 4, 17825, 3848.0, 10612.0, 12036.0, 15581.199999999995, 6.990251734429534, 2626.5893817852475, 0.7708337010001083], "isController": false}, {"data": ["GET /cart.html-1", 2129, 577, 27.101925786754343, 3895.4354156881213, 5, 12039, 2918.0, 9708.0, 10015.0, 10065.8, 6.991629092270457, 81.43963028764527, 0.7067776767036554], "isController": false}, {"data": ["GET /cart.html-0", 2129, 0, 0.0, 3887.085486143723, 17, 14247, 3624.0, 7108.0, 8002.5, 9403.399999999989, 7.0342726681006145, 11.12843918195605, 0.9617169663418809], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 1949, 0, 0.0, 3918.822473063106, 26, 14917, 3615.0, 7170.0, 8107.5, 9288.0, 6.442932608710025, 10.192920728623282, 0.9626647354810877], "isController": false}, {"data": ["GET /cart.html", 10234, 8712, 85.12800469024819, 2592.017393003726, 1, 23194, 532.5, 10446.5, 14133.75, 17759.25, 33.59264730018054, 2932.5437457687103, 3.2086032383472842], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 1949, 515, 26.42380708055413, 5482.812724474088, 2, 17530, 5341.0, 10585.0, 12003.0, 15526.0, 6.403769319735043, 2429.9767736555864, 0.7131891588522501], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 1949, 518, 26.577732170343765, 4105.53360697793, 2, 11108, 3661.0, 9584.0, 10015.0, 10088.5, 6.408612333208384, 75.04535148003926, 0.6524995006115967], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketTimeoutException", 40, 0.07713966135688664, 0.04163413999479573], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 10569, 20.382227022023372, 11.000780640124903], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException", 135, 0.26034635707949244, 0.1405152224824356], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 34202, 65.95826744320593, 35.599271402550094], "isController": false}, {"data": ["Assertion failed", 2997, 5.7796891271647315, 3.11943793911007], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3911, 7.542330389169591, 4.070778037991153], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 96075, 51854, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 34202, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 10569, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3911, "Assertion failed", 2997, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException", 135], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 2267, 555, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 335, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 175, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 45, "", "", "", ""], "isController": false}, {"data": ["05 Checkout Step One", 105, 84, "Assertion failed", 39, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException", 32, "Non HTTP response code: java.net.SocketTimeoutException", 13, "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-1", 2267, 556, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 341, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 168, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 47, "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 2267, 546, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 336, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 167, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 43, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 2373, 532, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 326, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 165, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 41, "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 2373, 540, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 331, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 165, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 44, "", "", "", ""], "isController": false}, {"data": ["03 Inventory Item (product details)", 97, 61, "Assertion failed", 32, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException", 24, "Non HTTP response code: java.net.SocketTimeoutException", 5, "", "", "", ""], "isController": false}, {"data": ["GET / (login)-3", 2373, 545, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 333, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 168, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 44, "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 10522, 8715, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 5875, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1989, "Assertion failed", 566, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 285, "", ""], "isController": false}, {"data": ["04 Cart", 107, 76, "Assertion failed", 43, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException", 26, "Non HTTP response code: java.net.SocketTimeoutException", 7, "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html", 10331, 8650, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 5857, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1969, "Assertion failed", 586, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 238, "", ""], "isController": false}, {"data": ["GET /inventory.html", 10425, 8681, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 5925, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1981, "Assertion failed", 522, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 253, "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 2266, 499, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 288, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 164, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 47, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["01 Login", 97, 70, "Assertion failed", 40, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException", 23, "Non HTTP response code: java.net.SocketTimeoutException", 7, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-2", 2266, 497, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 289, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 163, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 45, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 2266, 486, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 280, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 157, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 49, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 10127, 8718, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 5925, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1981, "Assertion failed", 540, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 272, "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 1949, 506, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 289, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 170, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 47, "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 2129, 577, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 350, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 189, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 38, "", "", "", ""], "isController": false}, {"data": ["02 Inventory (product search)", 94, 60, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException", 30, "Assertion failed", 22, "Non HTTP response code: java.net.SocketTimeoutException", 8, "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-2", 2129, 578, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 354, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 185, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 39, "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 2129, 577, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 351, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 189, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 37, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 10234, 8712, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 5828, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1982, "Assertion failed", 607, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 295, "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 1949, 515, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 290, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 172, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 53, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 1949, 518, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 299, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 171, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 48, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
