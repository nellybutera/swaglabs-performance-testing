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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [1.0, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [1.0, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [1.0, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)"], "isController": false}, {"data": [1.0, 500, 1500, "04 Cart"], "isController": true}, {"data": [1.0, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "01 Login"], "isController": true}, {"data": [1.0, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [1.0, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1250, 0, 0.0, 18.995999999999956, 3, 351, 13.0, 38.0, 52.0, 107.96000000000004, 74.4047619047619, 16639.055524553572, 17.345610119047617], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 50, 0, 0.0, 7.100000000000001, 3, 25, 5.0, 14.799999999999997, 17.449999999999996, 25.0, 5.233957918978332, 8.280284989008688, 0.7666930545378414], "isController": false}, {"data": ["GET /inventory-item.html-3", 50, 0, 0.0, 10.46, 5, 34, 9.0, 16.9, 22.449999999999996, 34.0, 5.231767290990897, 145.23774295019356, 0.7970270482368944], "isController": false}, {"data": ["05 Checkout Step One", 50, 0, 0.0, 32.06000000000001, 16, 121, 25.5, 53.9, 90.54999999999984, 121.0, 4.9465769687376335, 2765.4939930005935, 2.927368792045904], "isController": true}, {"data": ["GET /inventory-item.html-1", 50, 0, 0.0, 9.559999999999999, 4, 25, 8.0, 17.0, 22.89999999999999, 25.0, 5.234505862646566, 78.33867416509632, 0.7258787426716918], "isController": false}, {"data": ["GET /inventory-item.html-2", 50, 0, 0.0, 23.8, 11, 76, 20.5, 35.0, 49.24999999999998, 76.0, 5.227938101212882, 2691.1526133155585, 0.7913382868046842], "isController": false}, {"data": ["GET / (login)-0", 50, 0, 0.0, 8.159999999999998, 3, 61, 5.0, 14.799999999999997, 30.04999999999996, 61.0, 5.118231139318252, 8.097201607124578, 0.6547737102057529], "isController": false}, {"data": ["GET / (login)-1", 50, 0, 0.0, 15.379999999999997, 4, 79, 10.5, 32.0, 49.849999999999945, 79.0, 5.226845076311938, 78.22402421335981, 0.7248164070666945], "isController": false}, {"data": ["GET / (login)-2", 50, 0, 0.0, 35.02000000000001, 10, 142, 23.5, 66.9, 129.54999999999993, 142.0, 5.215395848544905, 2684.6963172786063, 0.7894398012934182], "isController": false}, {"data": ["03 Inventory Item (product details)", 50, 0, 0.0, 32.10000000000001, 18, 86, 29.0, 45.699999999999996, 71.89999999999999, 86.0, 5.31632110579479, 2972.2076854066986, 3.130607057416268], "isController": true}, {"data": ["GET / (login)-3", 50, 0, 0.0, 16.26, 5, 87, 10.0, 32.0, 51.89999999999982, 87.0, 5.225206395652628, 145.05560762618873, 0.796027536837705], "isController": false}, {"data": ["GET / (login)", 50, 0, 0.0, 50.78000000000002, 15, 351, 32.0, 84.39999999999999, 208.7499999999997, 351.0, 5.104124132298898, 2853.574242675582, 2.910945794201715], "isController": false}, {"data": ["04 Cart", 50, 0, 0.0, 32.93999999999999, 15, 129, 25.5, 53.9, 81.79999999999981, 129.0, 5.233957918978332, 2926.1607119491255, 3.0309932089396], "isController": true}, {"data": ["GET /inventory-item.html", 50, 0, 0.0, 32.10000000000001, 18, 86, 29.0, 45.699999999999996, 71.89999999999999, 86.0, 5.224114512590116, 2920.657536438199, 3.076309620206875], "isController": false}, {"data": ["GET /inventory.html", 50, 0, 0.0, 36.440000000000005, 16, 125, 30.0, 65.19999999999999, 90.19999999999985, 125.0, 5.317451877060512, 2972.8398682601296, 3.10530881101776], "isController": false}, {"data": ["GET /inventory.html-3", 50, 0, 0.0, 11.42, 5, 52, 8.5, 22.699999999999996, 27.89999999999999, 52.0, 5.331058748267406, 147.99414749706793, 0.8121534811813627], "isController": false}, {"data": ["GET /inventory.html-0", 50, 0, 0.0, 9.419999999999998, 3, 41, 5.0, 25.699999999999996, 30.449999999999996, 41.0, 5.343022013250694, 8.452827794400513, 0.756580265548194], "isController": false}, {"data": ["01 Login", 50, 0, 0.0, 50.78000000000002, 15, 351, 32.0, 84.39999999999999, 208.7499999999997, 351.0, 5.088540606554041, 2844.861925630979, 2.902058314675351], "isController": true}, {"data": ["GET /inventory.html-2", 50, 0, 0.0, 25.639999999999997, 11, 93, 16.5, 43.9, 62.299999999999855, 93.0, 5.321413367390379, 2739.2702845625795, 0.8054873749467858], "isController": false}, {"data": ["GET /inventory.html-1", 50, 0, 0.0, 10.980000000000002, 5, 53, 8.5, 19.699999999999996, 26.449999999999996, 53.0, 5.3316272126252935, 79.79217483738537, 0.739346742375773], "isController": false}, {"data": ["GET /checkout-step-one.html", 50, 0, 0.0, 32.06000000000001, 16, 121, 25.5, 53.9, 90.54999999999984, 121.0, 4.780571756382064, 2672.685082823406, 2.8291274261401664], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 50, 0, 0.0, 10.479999999999999, 4, 44, 8.0, 21.699999999999996, 28.04999999999996, 44.0, 4.786979415988511, 132.89010142412639, 0.7292663954044998], "isController": false}, {"data": ["GET /cart.html-3", 50, 0, 0.0, 12.26, 4, 41, 7.5, 32.09999999999999, 36.34999999999999, 41.0, 4.9338859285573315, 136.96833524521412, 0.751646684428656], "isController": false}, {"data": ["02 Inventory (product search)", 50, 0, 0.0, 36.440000000000005, 16, 125, 30.0, 65.19999999999999, 90.19999999999985, 125.0, 5.55000555000555, 3102.854177072927, 3.2411165223665224], "isController": true}, {"data": ["GET /cart.html-2", 50, 0, 0.0, 24.180000000000003, 10, 84, 18.5, 47.0, 58.749999999999936, 84.0, 4.930966469428008, 2538.2824056952663, 0.7463865261341223], "isController": false}, {"data": ["GET /cart.html-1", 50, 0, 0.0, 11.22, 4, 34, 9.0, 20.799999999999997, 26.24999999999998, 34.0, 4.935346954890929, 73.86151570674168, 0.6843938160102655], "isController": false}, {"data": ["GET /cart.html-0", 50, 0, 0.0, 7.620000000000001, 4, 38, 6.0, 11.899999999999999, 28.199999999999932, 38.0, 4.937296336526119, 7.810957094894835, 0.6750209835094302], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 50, 0, 0.0, 7.939999999999999, 3, 37, 5.0, 15.0, 28.89999999999999, 37.0, 4.786521156423511, 7.572426048248134, 0.7151735712234348], "isController": false}, {"data": ["GET /cart.html", 50, 0, 0.0, 32.93999999999999, 15, 129, 25.5, 53.9, 81.79999999999981, 129.0, 4.927564797477086, 2754.8648153395093, 2.853560473538977], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 50, 0, 0.0, 22.96000000000001, 11, 83, 18.0, 41.49999999999999, 69.29999999999994, 83.0, 4.783773440489858, 2462.512781644661, 0.7241063313241485], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 50, 0, 0.0, 10.719999999999999, 4, 55, 8.0, 20.0, 28.949999999999953, 55.0, 4.785604900459417, 71.6205030268951, 0.6636288045558958], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1250, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
