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

    var data = {"OkPercent": 60.12925155794289, "KoPercent": 39.87074844205711};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.250360718163833, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6498233215547703, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.4703180212014134, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.07423637066632298, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.4696113074204947, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.35901060070671376, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.661728825374695, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.48658069013593586, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.38009759498082957, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.08213968817340601, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.481700941094458, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.08615076383671424, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.08071319018404909, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.07949631137115237, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.08236629667003027, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.47614840989399293, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.6496466431095407, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.08800749531542786, 500, 1500, "01 Login"], "isController": true}, {"data": [0.3600706713780919, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.47791519434628976, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.07192710352849942, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.45841209829867674, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.46603705049037414, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.0852494031913557, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.3543407192154014, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.47838721394841993, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.6527424627678896, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.6529300567107751, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.0777863280749006, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.3449905482041588, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.4652173913043478, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 95318, 38004, 39.87074844205711, 698.569105520472, 0, 7225, 1074.0, 2861.0, 3510.9500000000007, 4696.0, 316.88796983982394, 40876.50125779084, 45.16357579335858], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 2830, 0, 0.0, 753.940636042401, 4, 4490, 571.0, 1759.8000000000002, 1958.3499999999995, 2648.8300000000004, 9.547360643957669, 15.104222893761156, 1.3985391568297365], "isController": false}, {"data": ["GET /inventory-item.html-3", 2830, 639, 22.579505300353357, 667.9335689045936, 2, 4705, 422.0, 1695.9, 2011.0, 3029.750000000004, 9.513948187643297, 209.706420869711, 1.1221253294582763], "isController": false}, {"data": ["05 Checkout Step One", 7759, 5767, 74.32658847789664, 598.8133780126294, 0, 7205, 14.0, 2640.0, 3442.0, 4664.199999999999, 26.200357262250076, 3857.872429750524, 4.348458457077879], "isController": true}, {"data": ["GET /inventory-item.html-1", 2830, 629, 22.226148409893995, 663.3893992932851, 3, 4675, 421.5, 1683.0, 1995.4499999999998, 2999.150000000002, 9.514907809621153, 115.89527877860357, 1.0261871675666043], "isController": false}, {"data": ["GET /inventory-item.html-2", 2830, 641, 22.65017667844523, 935.7872791519445, 2, 5248, 713.0, 2159.8, 2704.8499999999976, 3584.420000000001, 9.508833471093817, 3791.362119657161, 1.1133156376210445], "isController": false}, {"data": ["GET / (login)-0", 2869, 0, 0.0, 731.1422098292104, 4, 4495, 550.0, 1707.0, 1959.0, 2602.5000000000027, 9.575462252186101, 15.148680516153794, 1.2249858935902143], "isController": false}, {"data": ["GET / (login)-1", 2869, 597, 20.808644126873475, 654.764029278495, 2, 4691, 407.0, 1714.0, 1960.5, 2595.800000000001, 9.544308345364906, 117.94888594983998, 1.0481190826286269], "isController": false}, {"data": ["GET / (login)-2", 2869, 613, 21.366329731613803, 919.2621122342275, 3, 5242, 686.0, 2175.0, 2682.0, 3244.500000000001, 9.543006729000563, 3867.7571330358005, 1.1358618642291918], "isController": false}, {"data": ["03 Inventory Item (product details)", 7889, 5716, 72.45531753073901, 628.5813157561154, 0, 7154, 15.0, 2775.0, 3490.0, 4640.800000000003, 26.379233668047657, 4150.826892862159, 4.630812803449798], "isController": true}, {"data": ["GET / (login)-3", 2869, 623, 21.714883234576508, 649.0383408853263, 3, 4674, 385.0, 1689.0, 1956.0, 2580.0, 9.544308345364906, 212.465671293139, 1.1382779077039766], "isController": false}, {"data": ["GET / (login)", 7986, 5775, 72.31404958677686, 607.5607312797383, 2, 7192, 15.0, 2605.0, 3409.0, 4622.170000000001, 26.549731710074003, 4250.425527416604, 4.540453635835489], "isController": false}, {"data": ["04 Cart", 7824, 5715, 73.04447852760737, 614.8839468302646, 0, 7225, 15.0, 2722.0, 3471.25, 4673.5, 26.292089522145304, 4048.9682199429567, 4.431364832566033], "isController": true}, {"data": ["GET /inventory-item.html", 7862, 5716, 72.70414652760113, 623.7336555583811, 2, 7154, 15.0, 2715.7, 3468.5499999999984, 4642.959999999999, 26.414904161136963, 4170.713932858199, 4.652999505476506], "isController": false}, {"data": ["GET /inventory.html", 7928, 5734, 72.32593340060545, 623.61793642785, 2, 6299, 15.0, 2677.2000000000007, 3432.5499999999993, 4698.780000000001, 26.509996422086758, 4244.037308705991, 4.651724786161166], "isController": false}, {"data": ["GET /inventory.html-3", 2830, 599, 21.166077738515902, 672.5561837455842, 2, 4686, 444.5, 1702.8000000000002, 1967.4499999999998, 2673.730000000001, 9.468968217056858, 212.10468220925586, 1.1372093854873844], "isController": false}, {"data": ["GET /inventory.html-0", 2830, 0, 0.0, 746.4180212014134, 3, 3500, 582.0, 1738.9, 1941.1499999999987, 2481.69, 9.502320177824338, 15.03296746882366, 1.345543384555204], "isController": false}, {"data": ["01 Login", 8005, 5775, 72.14241099312929, 611.1380387257949, 0, 7192, 15.0, 2661.0, 3424.3999999999996, 4620.759999999998, 26.48022996946752, 4229.23674117436, 4.517819031156034], "isController": true}, {"data": ["GET /inventory.html-2", 2830, 590, 20.848056537102472, 964.1678445229679, 2, 5243, 743.5, 2256.8, 2767.45, 3400.5900000000006, 9.4633320960779, 3860.5928971924336, 1.1338024872178138], "isController": false}, {"data": ["GET /inventory.html-1", 2830, 584, 20.636042402826856, 671.7823321554761, 2, 4688, 451.0, 1694.9, 1963.8999999999996, 2633.76, 9.469031582398978, 117.22343626095379, 1.0421188923909805], "isController": false}, {"data": ["GET /checkout-step-one.html", 7737, 5767, 74.53793459997415, 594.1380379992227, 1, 7205, 14.0, 2589.3999999999996, 3402.0, 4664.86, 26.241974270180066, 3874.9875326667975, 4.367750000635953], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2645, 634, 23.96975425330813, 663.6862003780716, 3, 4678, 391.0, 1707.4, 1980.0999999999995, 2840.5599999999995, 8.973736976206874, 194.6393405119695, 1.0394039716843821], "isController": false}, {"data": ["GET /cart.html-3", 2753, 636, 23.102070468579733, 666.0661096985104, 2, 4696, 391.0, 1740.7999999999997, 2036.2999999999997, 3046.1000000000013, 9.29452119542465, 203.63967385088756, 1.088845625025321], "isController": false}, {"data": ["02 Inventory (product search)", 7959, 5734, 72.0442266616409, 628.1849478577705, 0, 6299, 15.0, 2740.0, 3441.0, 4693.199999999993, 26.523192380622305, 4229.611284535928, 4.635912980251735], "isController": true}, {"data": ["GET /cart.html-2", 2753, 629, 22.847802397384672, 941.3577915001835, 2, 5265, 702.0, 2252.0, 2757.199999999999, 3494.46, 9.29386226988998, 3696.2388030776424, 1.0853661547109046], "isController": false}, {"data": ["GET /cart.html-1", 2753, 602, 21.867054122775155, 665.6897929531432, 3, 4698, 403.0, 1708.6, 2019.6999999999975, 3021.2400000000016, 9.29436429991796, 113.62724274964467, 1.007029696473003], "isController": false}, {"data": ["GET /cart.html-0", 2753, 0, 0.0, 746.2426443879395, 3, 4590, 578.0, 1739.1999999999998, 1976.5999999999995, 2450.9000000000024, 9.320323926114511, 14.74504371123585, 1.2742630367734684], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 2645, 0, 0.0, 750.207183364841, 4, 4693, 589.0, 1729.4, 1962.6999999999998, 2659.6399999999994, 9.007567037412903, 14.250252539657133, 1.3458571843009515], "isController": false}, {"data": ["GET /cart.html", 7797, 5715, 73.29742208541747, 609.8925227651646, 1, 7225, 15.0, 2652.7999999999993, 3447.199999999999, 4676.0, 26.32111968564542, 4067.475383290545, 4.451619867516693], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2645, 633, 23.931947069943288, 942.39697542533, 3, 5242, 686.0, 2239.000000000001, 2766.0999999999995, 3461.0, 8.971393296384987, 3518.15977103868, 1.0329848156200605], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2645, 614, 23.21361058601134, 668.5810964083165, 3, 4691, 399.0, 1714.0, 1989.0, 2860.0199999999995, 8.97483314275244, 108.20631467626978, 0.9556503382103945], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 34646, 91.16408799073781, 36.34780419228267], "isController": false}, {"data": ["Assertion failed", 3358, 8.835912009262183, 3.522944249774439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 95318, 38004, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 34646, "Assertion failed", 3358, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 2830, 639, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 639, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["05 Checkout Step One", 54, 6, "Assertion failed", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-1", 2830, 629, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 629, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 2830, 641, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 641, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 2869, 597, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 597, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 2869, 613, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 613, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["03 Inventory Item (product details)", 65, 5, "Assertion failed", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-3", 2869, 623, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 623, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 7986, 5775, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5117, "Assertion failed", 658, "", "", "", "", "", ""], "isController": false}, {"data": ["04 Cart", 65, 12, "Assertion failed", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html", 7862, 5716, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5032, "Assertion failed", 684, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html", 7928, 5734, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5098, "Assertion failed", 636, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 2830, 599, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 599, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["01 Login", 46, 5, "Assertion failed", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-2", 2830, 590, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 590, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 2830, 584, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 584, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 7737, 5767, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5092, "Assertion failed", 675, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2645, 634, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 634, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 2753, 636, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 636, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["02 Inventory (product search)", 70, 6, "Assertion failed", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-2", 2753, 629, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 629, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 2753, 602, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 602, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 7797, 5715, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5044, "Assertion failed", 671, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2645, 633, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 633, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2645, 614, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 614, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
