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

    var data = {"OkPercent": 99.9973973583187, "KoPercent": 0.002602641681306526};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.18102137457641845, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.30234833659491195, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.30332681017612523, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.020715942989724893, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.3054468362687541, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.0967058056099152, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.31963543332267347, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.32187400063959065, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.11000959385992964, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.02440611780019525, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.31787655900223855, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.030060761112887753, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.023137512307187396, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.02217873450750163, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.028700419219606577, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.32102547565301515, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.32118671396323767, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.031918289179699966, 500, 1500, "01 Login"], "isController": true}, {"data": [0.11044824250241858, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.3198968074814576, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.017132401862940787, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.30256154357950765, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.30536360644948995, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.03057611844222723, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.09772951628825272, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.309641329384666, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.30750246791707797, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.3083832335329341, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.02056597564988483, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.09447771124417831, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.30538922155688625, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 76845, 2, 0.002602641681306526, 2281.9819376667547, 0, 13822, 2079.5, 4930.9000000000015, 6256.550000000007, 9585.980000000003, 127.67219422721315, 28599.410636784694, 29.809607913595105], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 3066, 0, 0.0, 1617.6203522504861, 7, 9779, 1427.5, 2826.500000000001, 3475.9500000000003, 5316.66, 5.140681299556185, 8.132718462188496, 0.7530294872396754], "isController": false}, {"data": ["GET /inventory-item.html-3", 3066, 0, 0.0, 1634.1898238747538, 10, 10194, 1428.5, 2881.0, 3712.9500000000003, 5201.32, 5.129938360427529, 142.41089626159507, 0.7815140470963813], "isController": false}, {"data": ["05 Checkout Step One", 3017, 1, 0.033145508783559825, 4123.103413987407, 0, 13791, 3741.0, 6391.400000000003, 7734.4, 10823.780000000004, 5.0579221780750725, 2817.392134612483, 2.982093685560529], "isController": true}, {"data": ["GET /inventory-item.html-1", 3066, 0, 0.0, 1628.405414220481, 9, 9871, 1411.5, 2878.3, 3710.2000000000007, 5268.33, 5.13012719904425, 76.77656184116518, 0.7114043576799645], "isController": false}, {"data": ["GET /inventory-item.html-2", 3066, 0, 0.0, 2464.977495107632, 20, 11047, 2238.0, 3975.9000000000005, 4690.500000000003, 6515.259999999998, 5.129466324702245, 2640.4629200628888, 0.7764328909461407], "isController": false}, {"data": ["GET / (login)-0", 3127, 0, 0.0, 1609.9110968979828, 7, 9550, 1414.0, 2899.0, 3612.2, 5443.479999999983, 5.2146824913741785, 8.249790660181805, 0.66711270153322], "isController": false}, {"data": ["GET / (login)-1", 3127, 0, 0.0, 1584.675087943718, 10, 9633, 1377.0, 2828.0000000000014, 3672.9999999999986, 5061.039999999988, 5.2015150431408035, 77.84493948841094, 0.721303843873041], "isController": false}, {"data": ["GET / (login)-2", 3127, 0, 0.0, 2441.5932203389857, 26, 11089, 2242.0, 4042.2000000000003, 4804.799999999999, 6509.44, 5.199231837189388, 2676.375671441012, 0.7869931003558157], "isController": false}, {"data": ["03 Inventory Item (product details)", 3073, 0, 0.0, 4089.4874715262035, 0, 13759, 3734.0, 6389.6, 7560.699999999997, 10393.979999999983, 5.131322104426496, 2862.245068480942, 3.014784146961533], "isController": true}, {"data": ["GET / (login)-3", 3127, 0, 0.0, 1594.8301886792467, 9, 10193, 1387.0, 2849.800000000001, 3654.999999999999, 5151.159999999994, 5.201852504940678, 144.40728628705926, 0.7924697175495565], "isController": false}, {"data": ["GET / (login)", 3127, 0, 0.0, 4059.199552286533, 37, 13822, 3650.0, 6532.000000000002, 7632.999999999999, 10362.119999999995, 5.195689920162168, 2904.7661351500383, 2.9631669075924862], "isController": false}, {"data": ["04 Cart", 3047, 0, 0.0, 4117.79028552675, 0, 12967, 3709.0, 6446.6, 7619.999999999999, 10858.159999999996, 5.099786434936299, 2843.6633692974697, 2.945540320343411], "isController": true}, {"data": ["GET /inventory-item.html", 3066, 0, 0.0, 4089.6082844096622, 28, 13759, 3722.5, 6391.200000000001, 7563.85, 10399.089999999995, 5.129277534734711, 2867.63681236355, 3.020463235786163], "isController": false}, {"data": ["GET /inventory.html", 3101, 0, 0.0, 4035.647210577236, 45, 13680, 3642.0, 6405.8, 7636.399999999998, 10898.060000000005, 5.1762357198656614, 2893.8898313143486, 3.0228407817184237], "isController": false}, {"data": ["GET /inventory.html-3", 3101, 0, 0.0, 1586.880361173816, 12, 9806, 1392.0, 2842.4000000000005, 3564.699999999999, 5155.96, 5.178128626652083, 143.74869381820193, 0.7888555329665283], "isController": false}, {"data": ["GET /inventory.html-0", 3101, 0, 0.0, 1609.2402450822324, 7, 9785, 1386.0, 2905.6000000000013, 3693.8999999999996, 5724.200000000001, 5.187900364207001, 8.207420498061857, 0.7346147976660304], "isController": false}, {"data": ["01 Login", 3133, 0, 0.0, 4060.2598148739185, 0, 13822, 3662.0, 6529.4, 7629.999999999997, 10360.859999999997, 5.189586373567398, 2895.7974365288164, 2.9540178918982494], "isController": true}, {"data": ["GET /inventory.html-2", 3101, 0, 0.0, 2417.5653015156377, 28, 11043, 2215.0, 3985.6000000000004, 4873.4999999999945, 6642.82, 5.176952960011753, 2664.9073148198, 0.783620809376779], "isController": false}, {"data": ["GET /inventory.html-1", 3101, 0, 0.0, 1586.6639793614959, 9, 9781, 1390.0, 2836.8, 3611.0, 5177.56, 5.178370741954822, 77.49856603560318, 0.7180943802320164], "isController": false}, {"data": ["GET /checkout-step-one.html", 3006, 1, 0.0332667997338656, 4126.797737857617, 50, 13791, 3734.0, 6401.6, 7736.6, 10826.969999999996, 5.053094474039433, 2825.0029575143344, 2.9901494285430914], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 3006, 1, 0.0332667997338656, 1659.0958083832313, 15, 10209, 1412.5, 2970.1000000000013, 3777.9000000000005, 5066.969999999996, 5.053995026707489, 140.2606269608189, 0.7696884189368451], "isController": false}, {"data": ["GET /cart.html-3", 3039, 0, 0.0, 1624.303718328397, 12, 9592, 1429.0, 2881.0, 3684.0, 5046.199999999999, 5.098753749823834, 141.54518832640832, 0.7767632665747246], "isController": false}, {"data": ["02 Inventory (product search)", 3107, 0, 0.0, 4041.3186353395586, 0, 13680, 3663.0, 6405.200000000001, 7634.599999999999, 10883.240000000018, 5.176047245799771, 2888.1962061808117, 3.0168934501845017], "isController": true}, {"data": ["GET /cart.html-2", 3039, 0, 0.0, 2469.265876933207, 27, 10562, 2252.0, 4071.0, 4808.0, 6617.599999999997, 5.0960604886784955, 2623.2668092492495, 0.7713763435011395], "isController": false}, {"data": ["GET /cart.html-1", 3039, 0, 0.0, 1610.9302402105948, 13, 10033, 1420.0, 2820.0, 3704.0, 5023.999999999996, 5.098223422637521, 76.29909565617189, 0.7069802011860624], "isController": false}, {"data": ["GET /cart.html-0", 3039, 0, 0.0, 1643.0151365580816, 8, 8863, 1415.0, 2912.0, 3593.0, 5820.599999999998, 5.115128256917794, 8.09229275020198, 0.6993339413754797], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 3006, 0, 0.0, 1612.4421157684599, 8, 8529, 1385.0, 2814.9000000000005, 3490.6000000000004, 5470.739999999997, 5.064118546870893, 8.011593794854344, 0.756650525069577], "isController": false}, {"data": ["GET /cart.html", 3039, 0, 0.0, 4118.505429417574, 40, 12967, 3706.0, 6449.0, 7624.0, 10876.79999999998, 5.0958724941939915, 2848.9609806651547, 2.951027723688513], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 3006, 0, 0.0, 2510.3157019294763, 40, 11035, 2252.0, 4145.0, 4929.250000000002, 6583.879999999997, 5.053595685446451, 2601.4074712120732, 0.764948565668164], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 3006, 0, 0.0, 1647.5545575515612, 12, 9863, 1410.0, 2953.3, 3785.0, 5157.479999999994, 5.0539695349541, 75.63679992497227, 0.7008434316049632], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 1, 50.0, 0.001301320840653263], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, 50.0, 0.001301320840653263], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 76845, 2, "Assertion failed", 1, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /checkout-step-one.html", 3006, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 3006, 1, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
