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

    var data = {"OkPercent": 78.54376965083567, "KoPercent": 21.456230349164322};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.05120094359854171, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.070298769771529, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.08721441124780316, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.012688488414858404, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.08347978910369068, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.06217047451669596, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.08729838709677419, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.09596774193548387, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.06491935483870968, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.018184908225696805, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.09596774193548387, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.01884057971014493, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.017029494382022472, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.010109664153529815, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.013062169312169311, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.09329140461215933, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.07966457023060797, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.027298850574712645, 500, 1500, "01 Login"], "isController": true}, {"data": [0.06247379454926625, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.09161425576519916, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.004265578635014837, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.06781720952843948, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.07568700512342803, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.017286796180441225, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.05938518863530508, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.07801583605030275, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.058919422449930134, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.052989790957705396, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.0026718916993231207, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.05007292173067574, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.06806028196402528, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 60430, 12966, 21.456230349164322, 5264.449164322372, 0, 26487, 5793.0, 12287.400000000009, 14622.600000000006, 17971.99, 196.214039872719, 33366.16716056034, 36.79323358050847], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 2276, 0, 0.0, 4523.163444639698, 24, 12501, 4472.0, 7735.4000000000015, 8894.3, 9784.0, 7.646487688684474, 12.09698247623911, 1.1200909700221398], "isController": false}, {"data": ["GET /inventory-item.html-3", 2276, 515, 22.627416520210897, 3784.437609841829, 2, 10709, 3180.0, 8645.500000000004, 9913.35, 10015.0, 7.494336441704863, 165.426997978653, 0.8833746369724987], "isController": false}, {"data": ["05 Checkout Step One", 2719, 1143, 42.03751379183523, 7801.212210371442, 0, 26389, 8297.0, 15438.0, 17149.0, 20140.4, 9.03388287516031, 2991.1727514396816, 3.3717587176222183], "isController": true}, {"data": ["GET /inventory-item.html-1", 2276, 511, 22.451669595782075, 3792.9723198593997, 1, 10313, 3193.0, 8677.2, 9890.7, 10017.0, 7.494015653141658, 91.39335152543224, 0.8058893854808385], "isController": false}, {"data": ["GET /inventory-item.html-2", 2276, 522, 22.934973637961335, 5110.659490333911, 2, 20690, 5098.5, 10004.3, 10600.450000000004, 18238.140000000003, 7.489034618687708, 2975.430297259107, 0.8736045976453632], "isController": false}, {"data": ["GET / (login)-0", 2480, 0, 0.0, 4254.872177419357, 7, 11750, 4204.0, 7400.9, 8210.95, 9635.33, 8.247916403376324, 13.048461497528951, 1.055153368010057], "isController": false}, {"data": ["GET / (login)-1", 2480, 513, 20.68548387096774, 3880.7479838709637, 2, 10831, 3406.0, 8833.9, 10003.0, 10017.0, 8.085234015361944, 100.36545543014748, 0.8892700407032849], "isController": false}, {"data": ["GET / (login)-2", 2480, 514, 20.725806451612904, 5253.460080645166, 2, 21313, 5330.5, 10010.0, 10785.9, 18637.420000000002, 8.07065730296857, 3297.8268914942023, 0.9684394688498662], "isController": false}, {"data": ["03 Inventory Item (product details)", 2942, 1222, 41.53636981645139, 7922.652957172006, 0, 26000, 7726.0, 15929.2, 17620.85, 22894.7, 9.634308880789346, 3233.503482080578, 3.6412896203584535], "isController": true}, {"data": ["GET / (login)-3", 2480, 515, 20.766129032258064, 3867.5205645161263, 2, 10771, 3394.0, 8864.400000000001, 10004.0, 10022.19, 8.085497616734372, 182.25794843844753, 0.9759830359413411], "isController": false}, {"data": ["GET / (login)", 3105, 1190, 38.32528180354267, 7974.380032206116, 2, 26341, 7949.0, 15649.000000000002, 17604.899999999998, 24163.700000000004, 10.095952189732367, 3594.515271219993, 3.8594713769188003], "isController": false}, {"data": ["04 Cart", 2848, 1130, 39.67696629213483, 7743.476123595505, 0, 26487, 8020.0, 15444.399999999998, 17281.199999999997, 21887.619999999963, 9.38178392249487, 3198.4652417649972, 3.482907886685641], "isController": true}, {"data": ["GET /inventory-item.html", 2918, 1222, 41.87799862919808, 7953.301919122693, 2, 26000, 7823.5, 15912.4, 17622.399999999998, 22897.1, 9.599157853183545, 3248.2038844433114, 3.6578439314439857], "isController": false}, {"data": ["GET /inventory.html", 3024, 1158, 38.29365079365079, 8012.32043650794, 3, 26028, 8504.5, 15581.0, 16993.0, 22495.75, 9.898527004909983, 3514.8539183970947, 3.8834710004091653], "isController": false}, {"data": ["GET /inventory.html-3", 2385, 465, 19.49685534591195, 4019.5836477987377, 2, 10310, 3634.0, 8844.0, 10002.0, 10017.0, 7.81280710719761, 178.58905752998186, 0.9581744565431032], "isController": false}, {"data": ["GET /inventory.html-0", 2385, 0, 0.0, 4392.968972746337, 19, 12209, 4335.0, 7485.4000000000015, 8450.099999999995, 9732.819999999998, 7.9804854544359465, 12.625377379088118, 1.1300492098566524], "isController": false}, {"data": ["01 Login", 3132, 1190, 37.994891443167305, 7937.119412515955, 0, 26341, 7843.0, 15655.000000000005, 17590.899999999998, 24148.850000000006, 10.134315270394016, 3577.0689345328333, 3.8407390494711198], "isController": true}, {"data": ["GET /inventory.html-2", 2385, 476, 19.958071278825997, 5285.62389937106, 1, 20046, 5580.0, 10004.0, 10336.899999999998, 16321.379999999997, 7.8076662443652225, 3221.0428849521145, 0.9459551081697325], "isController": false}, {"data": ["GET /inventory.html-1", 2385, 458, 19.20335429769392, 4019.246960167711, 2, 10312, 3670.0, 8788.6, 10002.7, 10015.279999999999, 7.812832700553941, 98.39933348818411, 0.8753671478574494], "isController": false}, {"data": ["GET /checkout-step-one.html", 2696, 1143, 42.396142433234424, 7832.543397626099, 4, 26389, 8353.5, 15379.900000000001, 17163.0, 20189.260000000308, 9.00717299719027, 3007.771668107099, 3.3904696202103453], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2057, 461, 22.41127856101118, 3874.505104521153, 1, 11645, 3529.0, 8253.4, 9856.199999999997, 10016.42, 6.891168450039866, 152.46975194348036, 0.814546914887202], "isController": false}, {"data": ["GET /cart.html-3", 2147, 427, 19.888216115510016, 3940.9888216115614, 1, 10776, 3688.0, 8404.4, 9732.399999999998, 10016.0, 7.117355141766974, 161.98492241913002, 0.8686397133167804], "isController": false}, {"data": ["02 Inventory (product search)", 3037, 1158, 38.12973328943036, 8016.02831741851, 0, 26028, 8506.0, 15631.800000000003, 16993.0, 22495.62, 9.902604283846397, 3501.2500434329218, 3.86844043153117], "isController": true}, {"data": ["GET /cart.html-2", 2147, 420, 19.562179785747556, 5234.334885887297, 1, 21512, 5669.0, 10002.0, 10377.8, 16113.04, 7.11193261054633, 2948.4335780544543, 0.865923782118806], "isController": false}, {"data": ["GET /cart.html-1", 2147, 414, 19.28272007452259, 3925.993479273404, 1, 10640, 3618.0, 8266.800000000001, 9714.8, 10014.0, 7.115986941318794, 89.54324781871966, 0.7965078281656531], "isController": false}, {"data": ["GET /cart.html-0", 2147, 0, 0.0, 4529.454122030752, 32, 12393, 4472.0, 7592.6, 8558.8, 9719.24, 7.270399956655277, 11.501999931427294, 0.9939999940739637], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 2057, 0, 0.0, 4664.187651920276, 33, 10204, 4639.0, 7739.200000000001, 8609.099999999999, 9823.42, 7.027361271962639, 11.117505137284644, 1.0499865962991053], "isController": false}, {"data": ["GET /cart.html", 2807, 1130, 40.25650160313502, 7811.152475952971, 3, 26487, 8181.0, 15485.800000000003, 17303.799999999996, 21954.04000000001, 9.289226879521342, 3213.1673981788053, 3.498917520261237], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2057, 457, 22.216820612542538, 5134.263976665047, 3, 21363, 5493.0, 10003.0, 10285.099999999999, 16758.780000000006, 6.886254607296015, 2761.2571376995656, 0.810775297863152], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2057, 455, 22.119591638308215, 3858.9042294603755, 1, 10305, 3536.0, 8229.0, 9802.599999999999, 10015.0, 6.891653293218573, 84.3148777219434, 0.7442863059800253], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5241, 40.42110134197131, 8.672844613602516], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 3006, 23.183711244794075, 4.974350488168128], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 2081, 16.049668363412, 3.4436538143306303], "isController": false}, {"data": ["Assertion failed", 2638, 20.345519049822613, 4.365381433063048], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 60430, 12966, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5241, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 3006, "Assertion failed", 2638, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 2081, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 2276, 515, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 215, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 194, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 106, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html-1", 2276, 511, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 209, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 193, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 109, "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 2276, 522, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 216, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 199, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 107, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 2480, 513, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 198, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 166, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 149, "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 2480, 514, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 197, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 165, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 152, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-3", 2480, 515, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 199, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 168, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 148, "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 3105, 1190, "Assertion failed", 565, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 448, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 91, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 86, "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html", 2918, 1222, "Assertion failed", 580, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 464, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 90, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 88, "", ""], "isController": false}, {"data": ["GET /inventory.html", 3024, 1158, "Assertion failed", 519, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 475, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 91, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 73, "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 2385, 465, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 194, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 142, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 129, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory.html-2", 2385, 476, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 201, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 145, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 130, "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 2385, 458, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 190, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 140, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 128, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 2696, 1143, "Assertion failed", 504, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 485, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 90, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 64, "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2057, 461, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 191, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 176, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 94, "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 2147, 427, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 182, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 155, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 90, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html-2", 2147, 420, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 180, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 149, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 91, "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 2147, 414, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 179, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 145, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 90, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 2807, 1130, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 499, "Assertion failed", 470, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 101, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 60, "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2057, 457, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 187, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 177, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 93, "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2057, 455, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 186, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8080 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: getsockopt", 177, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 92, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
