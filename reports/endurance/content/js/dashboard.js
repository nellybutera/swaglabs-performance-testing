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

    var data = {"OkPercent": 74.76483743333907, "KoPercent": 25.235162566660932};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6054664350669255, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.976893859464022, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.8737075332348597, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.3402584493041749, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.8762397130196244, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.8128297109094745, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.9782381251307805, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.8849131617493199, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.8213015275162168, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.3379634206623826, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.8832391713747646, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.3445452752022095, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.3375619425173439, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.3363230921704658, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.3418190805734058, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.876486542875026, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.9788232839557688, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.3460932887226924, 500, 1500, "01 Login"], "isController": true}, {"data": [0.8194241602336741, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.8757563112872939, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.337095485417499, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.8747865072587532, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.8766773162939298, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.3433122903925824, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.8198083067092652, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.8816826411075612, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.9768903088391906, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.9776900085397097, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.33558648111332007, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.8198121263877028, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.8804440649017934, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 145325, 36673, 25.235162566660932, 172.17738173060323, 0, 2797, 59.0, 299.0, 416.0, 692.0, 242.8405281750156, 39933.66826038161, 42.58647551521628], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 4739, 0, 0.0, 144.32496307237764, 2, 1561, 72.0, 371.0, 479.0, 856.2000000000062, 8.008205918535642, 12.66923201955834, 1.1730770388479945], "isController": false}, {"data": ["GET /inventory-item.html-3", 4739, 498, 10.508546106773581, 137.25596117324315, 2, 1568, 67.0, 357.0, 462.0, 730.0, 8.008260049614373, 201.00113779257862, 1.0918032251877436], "isController": false}, {"data": ["05 Checkout Step One", 10060, 5869, 58.33996023856859, 185.4118290258453, 0, 2655, 17.0, 681.8999999999996, 908.0, 1469.3899999999994, 16.957209173749025, 3995.934236242916, 4.319455882284773], "isController": true}, {"data": ["GET /inventory-item.html-1", 4739, 490, 10.3397341211226, 136.5553914327919, 2, 1603, 66.0, 356.0, 462.0, 729.0000000000018, 8.008124723289635, 109.47123639313742, 0.9956787504604798], "isController": false}, {"data": ["GET /inventory-item.html-2", 4739, 504, 10.635155096011816, 243.92656678624257, 2, 1900, 154.0, 584.0, 716.0, 1112.6000000000022, 8.008111190908707, 3685.945978861265, 1.0832496118668413], "isController": false}, {"data": ["GET / (login)-0", 4779, 0, 0.0, 142.44653693241278, 2, 1554, 68.0, 375.0, 480.0, 827.3999999999996, 8.138069613786527, 12.874680443685715, 1.0411007025449561], "isController": false}, {"data": ["GET / (login)-1", 4779, 450, 9.416195856873824, 136.39924670433177, 2, 1564, 64.0, 359.0, 464.0, 755.5999999999995, 8.140384585903286, 112.22139890663087, 1.022548383037544], "isController": false}, {"data": ["GET / (login)-2", 4779, 467, 9.771918811466834, 243.82841598660784, 2, 1979, 150.0, 596.0, 714.0, 1232.3999999999996, 8.140384585903286, 3782.8301444730896, 1.1117787949709832], "isController": false}, {"data": ["03 Inventory Item (product details)", 10115, 5915, 58.477508650519034, 187.8173999011371, 0, 2797, 17.0, 676.0, 911.1999999999989, 1457.0800000000017, 16.9629665654311, 3999.4365832514395, 4.310817446972911], "isController": true}, {"data": ["GET / (login)-3", 4779, 461, 9.646369533375182, 135.82444025946816, 2, 1569, 65.0, 359.0, 462.0, 713.5999999999985, 8.140398451978633, 206.09528556016127, 1.1205104527213017], "isController": false}, {"data": ["GET / (login)", 10138, 5875, 57.95028605247583, 188.60465575064154, 1, 2599, 18.0, 693.0, 915.0499999999993, 1485.6600000000035, 16.946149422981772, 4057.9091745422675, 4.215980911657874], "isController": false}, {"data": ["04 Cart", 10090, 5914, 58.61248761149653, 185.6165510406335, 0, 2603, 17.0, 679.0, 906.4499999999989, 1501.8100000000013, 16.95963640153158, 3992.0548682424082, 4.213355500935386], "isController": true}, {"data": ["GET /inventory-item.html", 10090, 5915, 58.62239841427156, 188.28275520317146, 1, 2797, 17.0, 676.8999999999996, 912.0, 1460.4400000000023, 16.95886676448689, 4008.3769661213437, 4.320453893921363], "isController": false}, {"data": ["GET /inventory.html", 10115, 5892, 58.2501235788433, 188.09036085022268, 1, 2476, 18.0, 676.0, 906.1999999999989, 1536.0, 16.961800315256397, 4060.908239479575, 4.327548763603817], "isController": false}, {"data": ["GET /inventory.html-3", 4793, 493, 10.285833507197998, 134.62945962862557, 2, 1546, 63.0, 351.0, 466.0, 728.1200000000008, 8.079115662999909, 203.23527558836122, 1.1042044523630528], "isController": false}, {"data": ["GET /inventory.html-0", 4793, 0, 0.0, 141.72126017108272, 2, 1576, 69.0, 367.60000000000036, 476.0, 810.7800000000052, 8.079142899523982, 12.781456540262552, 1.1440192582333766], "isController": false}, {"data": ["01 Login", 10162, 5875, 57.81342255461524, 188.1592206258614, 0, 2599, 18.0, 692.7000000000007, 914.0, 1484.2200000000048, 16.933985452303386, 4045.4195549897304, 4.203004771640323], "isController": true}, {"data": ["GET /inventory.html-2", 4793, 491, 10.244105987899019, 241.82078030461093, 2, 1780, 148.0, 580.6000000000004, 716.2000000000007, 1199.1800000000012, 8.079265466154906, 3734.8831278329267, 1.0976568623608718], "isController": false}, {"data": ["GET /inventory.html-1", 4793, 497, 10.369288545795952, 134.4491967452536, 2, 1585, 63.0, 349.60000000000036, 462.60000000000036, 772.1800000000012, 8.079115662999909, 110.4117604082035, 1.0041741957124892], "isController": false}, {"data": ["GET /checkout-step-one.html", 10012, 5869, 58.61965641230523, 186.3007391130648, 1, 2655, 17.0, 683.0, 909.0, 1469.8700000000008, 16.925199139878014, 4007.5124642038463, 4.331971514904217], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 4684, 486, 10.375747224594363, 136.66481639624308, 2, 1588, 63.0, 361.5, 477.0, 736.7499999999982, 8.002528553001376, 201.12644006325652, 1.0926408216088772], "isController": false}, {"data": ["GET /cart.html-3", 4695, 492, 10.47923322683706, 134.58509052183197, 2, 1576, 62.0, 352.0, 455.39999999999964, 707.3999999999996, 7.9698385322595975, 200.09595641298276, 1.086920945397694], "isController": false}, {"data": ["02 Inventory (product search)", 10138, 5892, 58.117971986585125, 187.66364174393397, 0, 2476, 18.0, 674.1000000000004, 906.0, 1536.0, 16.96673929997557, 4052.87507327136, 4.318988137152272], "isController": true}, {"data": ["GET /cart.html-2", 4695, 476, 10.138445154419596, 242.93674121405795, 1, 1980, 147.0, 586.4000000000005, 713.1999999999998, 1174.6399999999994, 7.9698385322595975, 3688.6115714002894, 1.0840646754730978], "isController": false}, {"data": ["GET /cart.html-1", 4695, 470, 10.010649627263046, 134.29222577209768, 1, 1566, 62.0, 351.0, 450.0, 747.3999999999996, 7.969825003352589, 109.27636685098125, 0.9945538202961482], "isController": false}, {"data": ["GET /cart.html-0", 4695, 0, 0.0, 142.66879659211943, 2, 1591, 67.0, 371.0, 484.1999999999998, 842.04, 7.9697438308750765, 12.608383794939087, 1.0896134143774518], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 4684, 0, 0.0, 141.1669513236549, 2, 1591, 68.5, 359.0, 479.5, 789.1499999999996, 8.002487536689458, 12.660185360778245, 1.1956841729623897], "isController": false}, {"data": ["GET /cart.html", 10060, 5914, 58.78727634194831, 186.17007952286184, 1, 2603, 17.0, 680.8999999999996, 907.0, 1504.5099999999948, 16.956380301607823, 4003.1908796617404, 4.22510884013555], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 4684, 473, 10.098206660973528, 243.78159692570432, 2, 1727, 145.5, 591.0, 735.75, 1151.0, 8.002432848927599, 3705.346650406742, 1.0889855952151124], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 4684, 460, 9.82066609735269, 136.77561912894973, 2, 1598, 62.0, 355.0, 468.0, 747.5999999999985, 8.002528553001376, 109.9153073558682, 1.0007431895645933], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 33933, 92.52856324816622, 23.349733356270427], "isController": false}, {"data": ["Assertion failed", 2740, 7.4714367518337745, 1.8854292103905042], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 145325, 36673, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 33933, "Assertion failed", 2740, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 4739, 498, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 498, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html-1", 4739, 490, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 490, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 4739, 504, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 504, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 4779, 450, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 450, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 4779, 467, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 467, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-3", 4779, 461, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 461, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 10138, 5875, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5359, "Assertion failed", 516, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html", 10090, 5915, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5351, "Assertion failed", 564, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html", 10115, 5892, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5322, "Assertion failed", 570, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 4793, 493, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 493, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory.html-2", 4793, 491, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 491, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 4793, 497, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 497, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 10012, 5869, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5328, "Assertion failed", 541, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 4684, 486, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 486, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 4695, 492, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 492, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html-2", 4695, 476, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 476, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 4695, 470, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 470, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 10060, 5914, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 5365, "Assertion failed", 549, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 4684, 473, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 473, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 4684, 460, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 460, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
