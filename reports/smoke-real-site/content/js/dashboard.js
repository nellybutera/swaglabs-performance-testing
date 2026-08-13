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

    var data = {"OkPercent": 55.55555555555556, "KoPercent": 44.44444444444444};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.0, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.0, 500, 1500, "01 Login"], "isController": true}, {"data": [0.0, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.0, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.0, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.0, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.0, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.0, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.0, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.0, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.0, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.0, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.0, 500, 1500, "GET /cart.html"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 45, 20, 44.44444444444444, 7185.977777777777, 5615, 15969, 5821.0, 13866.6, 15628.899999999998, 15969.0, 1.1658635162443651, 147.29562169672005, 0.22669568371418208], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory.html", 5, 5, 100.0, 5680.2, 5615, 5760, 5646.0, 5760.0, 5760.0, 5760.0, 0.6514657980456027, 2.5428796824104234, 0.0941571661237785], "isController": false}, {"data": ["05 Checkout Step One", 5, 5, 100.0, 5685.0, 5620, 5774, 5635.0, 5774.0, 5774.0, 5774.0, 0.6891798759476223, 2.6759562370778776, 0.1049922467263956], "isController": true}, {"data": ["01 Login", 5, 0, 0.0, 14964.0, 13741, 15969, 15274.0, 15969.0, 15969.0, 15969.0, 0.3057729941291585, 171.46411753913895, 0.17796943798923678], "isController": true}, {"data": ["GET / (login)-0", 5, 0, 0.0, 7085.0, 6765, 7267, 7161.0, 7267.0, 7267.0, 7267.0, 0.688041832943443, 1.3567324893353516, 0.09003672423283335], "isController": false}, {"data": ["GET /checkout-step-one.html", 5, 5, 100.0, 5685.0, 5620, 5774, 5635.0, 5774.0, 5774.0, 5774.0, 0.6892748828232699, 2.676325130962228, 0.10500672043010753], "isController": false}, {"data": ["GET / (login)-1", 5, 0, 0.0, 6252.0, 5816, 6715, 6251.0, 6715.0, 6715.0, 6715.0, 0.7446016381236039, 11.458575716679077, 0.10543675539836188], "isController": false}, {"data": ["GET / (login)-2", 5, 0, 0.0, 7756.4, 6649, 8684, 8391.0, 8684.0, 8684.0, 8684.0, 0.5753739930955121, 296.4261633342923, 0.0887784090909091], "isController": false}, {"data": ["03 Inventory Item (product details)", 5, 5, 100.0, 5684.2, 5621, 5770, 5631.0, 5770.0, 5770.0, 5770.0, 0.6636580833554553, 2.5768599017786036, 0.0991598503451022], "isController": true}, {"data": ["GET / (login)-3", 5, 0, 0.0, 5883.0, 5821, 6056, 5824.0, 6056.0, 6056.0, 6056.0, 0.8253549026081215, 23.280650328078575, 0.12815569288544074], "isController": false}, {"data": ["GET / (login)", 5, 0, 0.0, 14964.0, 13741, 15969, 15274.0, 15969.0, 15969.0, 15969.0, 0.3110419906687403, 174.4187402799378, 0.18103615863141526], "isController": false}, {"data": ["04 Cart", 5, 5, 100.0, 5684.0, 5629, 5763, 5635.0, 5763.0, 5763.0, 5763.0, 0.6759497093416249, 2.6239258736649993, 0.09439532073813708], "isController": true}, {"data": ["02 Inventory (product search)", 5, 5, 100.0, 5680.2, 5615, 5760, 5646.0, 5760.0, 5760.0, 5760.0, 0.6514657980456027, 2.5428796824104234, 0.0941571661237785], "isController": true}, {"data": ["GET /inventory-item.html", 5, 5, 100.0, 5684.2, 5621, 5770, 5631.0, 5770.0, 5770.0, 5770.0, 0.6635700066357001, 2.5765179163901792, 0.0991466904445919], "isController": false}, {"data": ["GET /cart.html", 5, 5, 100.0, 5684.0, 5629, 5763, 5635.0, 5763.0, 5763.0, 5763.0, 0.6760411032990806, 2.624280650013521, 0.0944080837614927], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404/Not Found", 20, 100.0, 44.44444444444444], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 45, 20, "404/Not Found", 20, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET /inventory.html", 5, 5, "404/Not Found", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /checkout-step-one.html", 5, 5, "404/Not Found", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html", 5, 5, "404/Not Found", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html", 5, 5, "404/Not Found", 5, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
