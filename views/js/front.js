/**
* 2007-2021 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author    PrestaShop SA <contact@prestashop.com>
*  @copyright 2007-2021 PrestaShop SA
*  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*
* Don't forget to prefix your containers with your own identifier
* to avoid any conflicts with others containers.
*/

/* Defined ID's name used to identify certain objects */

var ListContainerName = '#ListContainer';
//The textare box used for inputing partnumbers
var partNumberListName = '#partNumberList'
//Defines the id for the warning element that is displayed to user
var noProductsInListName = '#noProductsInList';
//The heading used for the part number tables
var orderListHeadingName = '#orderListHeading';

var partsList = [];
var rejectList = [];
var recognizedTypes = [
    'text/plain', 'application/vnd.ms-excel', 'text/x-csv', 
    'application/csv','application/x-csv','text/csv',
    'text/comma-separated-values','text/x-comma-separated-values','text/tab-separated-values'
];

$('#add_to_cart').click(function(e) {
    e.preventDefault(); // avoid to execute the actual submit of the form.
    if(Array.isArray(partsList) && partsList.length > 0){
        console.log('Adding selected parts to cart.');
        for(idx in partsList)
        {
            var product = partsList[idx];
            var id_product_attribute = 0;
            if(product.hasOwnProperty('combinations') && !Array.isArray(product.combinations))
            {
                var combo = partsList[idx].combinations[Object.keys(product.combinations)[0]];
                id_product_attribute = combo.id_product_attribute;
            }
            var qty = product.hasOwnProperty('toOrder') && product.toOrder != null ? product.toOrder : 1;
            addToCart(product.id_product, id_product_attribute, qty, link_token);
        }
    }
    else 
    {
        $(partNumberListName).focus();
        console.log('No Items selected.');
    }
});

$('#getFile').on('change', function(e) { 
    var myFile = $('#getFile').prop('files')[0];
    
    console.log(myFile);
    console.log(myFile.type);
    if(!(typeof document.createElement('canvas').getContext === "function") )
    {
        $(ListContainerName).html(''); 
        $(ListContainerName).append(warningNotice);
        $(noProductsInListName).append('Failed to load '+myFile.name+'. Please try again in another web browser or use the text box.');       
    }
    
    if(myFile != null && isValidFileType(myFile.type, recognizedTypes))
    {
        console.log('true-ish');
        var reader = new FileReader();
        reader.readAsText(myFile);
        reader.onload = function(e) {
            // browser completed reading file - display it
            $(partNumberListName).val(e.target.result.trim());
            $("input:radio[name ='list_type']").each(function(){
                $(this).prop('checked', false);
            });
        };
    }
    else 
    {
        $(ListContainerName).html(''); 
        $(ListContainerName).append(warningNotice);
        $(noProductsInListName).append('The selected file '+myFile.name+' is not a supported filetype. Please select a file with a comma delimited list or use the text box.');
    }
});

function isValidFileType(type, typeList)
{
    if(type != null && Array.isArray(typeList) && typeList.length > 0)
    {
        for(idx in typeList)
        {
            if(typeList[idx] == type){ return true;}
        }
    }
    return false;
}
/**
* Generates a POST request to add a product to the users cart
*/
function addToCart(id_product, id_product_attribute, id_quantity, static_link_token){
    if(static_link_token.length > 0)
    {
        $.post("index.php?controller=cart&update=1&id_product=" + id_product + "&id_product_attribute=" + id_product_attribute + "&qty=" + id_quantity + "&token=" + static_link_token + "&op=up", 
        function () {
            prestashop.emit('updateCart', {
                reason: 'update'
            });
            document.location.href="/cart";
        });
    }
}

var spinner = '<div class="loading"><div class="spinner"></div><br><br><h1>Submitting Parts List...</h1></div>';

$('#submit_parts').submit(function(e){
    e.preventDefault(); // avoid to execute the actual submit of the form.
    
    console.log('Submitting SKU List...');
    var list = $(partNumberListName).val().trim();
    console.log(list);
    
    var withQuantity = $("input:radio[name ='list_type']:checked").val() == 'true' ? true : false;
    
    $(partNumberListName).prop('disabled', true);
    $(ListContainerName).html('');
    $(ListContainerName).append(spinner);
    
    $.ajax({ 
        type: 'POST', 
        cache: false, 
        dataType: 'json', 
        url: controllerURL, 
        data: { 
            ajax: true, 
            action: 'submitBulkOrder',//lowercase with action name 
            submit_parts: list,
            hasQuantity: withQuantity,
        }, 
        success : function (data) {
            console.log(data);
            $(ListContainerName).html('');            
            $(partNumberListName).prop('disabled', false);
            
            partsList = data[0];
            rejectList = data[1];
            
            GenerateList(ListContainerName, partsList);
            ShowRejects(ListContainerName, rejectList);
        }, 
        error : function (data){ 
            console.log(data); 
            $(ListContainerName).html(''); 
            $(partNumberListName).prop('disabled', true);
            $(ListContainerName).append(warningNotice);
            $(noProductsInListName).append('Failed to load product or received no response from the server. Please try again later.');
        } 
    });
});

var baseTable = '<table class="table table-hover wlp_bought_list" id="table_orderlist">'
    + '<thead><tr>'
    + '<th class="hidden-md-down col-lg-1 checkbox-col nopadding-right" id="orderlist-product-checkbox">&nbsp;</th>'
    + '<th class="hidden-md-down col-lg-2 orderlist-product-partNo">Part Number</th>'
    + '<th class="col-xs-7 col-lg-3 orderlist-product-desc">Items</th>'
    + '<th class="hidden-md-down col-lg-2 orderlist-product-brand"  id="orderlist-product-brand">Brand</th>'
    + '<th class="hidden-md-down col-lg-1 orderlist-product-price" id="orderlist-product-price">Price</th>'
    + '<th class="col-xs-1 col-lg-1 orderlist-product-quantity" id="orderlist-product-qty">Quantity</th>'
    + '<th class="col-lg-2 hidden-md-down orderlist-product-actions" id="orderlist-product-action">&nbsp;</th>'
    + '</tr></thead><tbody id="table_body"></tbody></table>';

var warningNotice = '<div class="alert alert-warning" id="'+noProductsInListName.replace('#', '')+'"></div>';

/**
* Checks the paramete if it is a list or string otherwise return 0
*/
function GetItemCount(list){
    if(Array.isArray(list)){
        return list.length;
    }
    else if (typeof list === 'string'){
        return list.length;
    }
    return 0;
}
/**
* Generates a table for 'found' part numbers
*/
function GenerateList(objectName = '#ListContainer', dataList){
    if(Array.isArray(dataList))
    {
        $(objectName).append('<h1 id="'+orderListHeadingName.replace('#', '')+'">Order List ('+GetItemCount(dataList)+' Items)</h1>');
        $(objectName).append(baseTable);
        
        for(idx in dataList)
        {
            $('#table_orderlist #table_body').append(CreateProductObject(dataList[idx]));
        }
    }
    else 
    {
        $(objectName).append(warningNotice);
        $(noProductsInListName).append('Failed to load product or received no response from the server. Please try again later.');
    }
}
/**
* Gets the products combination name and combination part number
*/
function GetReferenceNumber(product){
    if(product != null && product.hasOwnProperty('combinations') && !Array.isArray(product.combinations))
    {
        var combo = product.combinations[Object.keys(product.combinations)[0]];
        var nameTxt = combo.attributes;
        var partNoTxt = combo.combination_reference;
        
        return [nameTxt, partNoTxt];
    }
    return ['',''];
}
/**
* Generates a table row for a 'found' part number
*/
function CreateProductObject(product){
    if(product !== null){
        var name = product.hasOwnProperty('name') ? product.name : "";
        var mfgName = product.hasOwnProperty('manufacturer_name') ? product.manufacturer_name : "";
        var partNo = product.hasOwnProperty('reference') ? product.reference : "";
        var price = product.hasOwnProperty('price_tax_excl') ? product.price_tax_excl : "";
        var productLink = product.hasOwnProperty('link_rewrite') && product.link_rewrite != null && product.link_rewrite.length > 0 ? product.link_rewrite : "#";
        var productImage = product.hasOwnProperty('image_small_default') && product.image_small_default != null && product.image_small_default.length > 0 ? product.image_small_default : "";
        var qty = product.hasOwnProperty('toOrder') && product.toOrder > 0 ? product.toOrder : 1;
        
        if(/^([0-9]{1,}\.[0-9]{1})$/.test(price)){ price += '0'; }
        
        if(!(/^([0-9]{1,}\.[0-9]{2})$/.test(price))){ price += '.00'; }
        
        if(!(/^(https?:\/\/)/.test(productImage))){ productImage = 'https://'+productImage; }
        
        if(product.hasOwnProperty('combinations') && !Array.isArray(product.combinations))
        {
            var combo = GetReferenceNumber(product);
            name += ' '+combo[0];
            partNo = partNo.length > 0 ? partNo : combo[1];
        }
        
        var tableRow = '<tr><td class="hidden-md-down col-lg-1 checkbox-col nopadding-right"><img src="'+productImage+'" alt="'+name.trim()+'"></td>'
            + '<td class="col-xs-3 col-lg-2 checkbox-col orderlist-product-partNo"><p class="product_partNo">'+partNo+'</p></td>'
            + '<td class="col-xs-12 col-lg-3 checkbox-col orderlist-product-desc"><p class="product_name"><a href="'+productLink+'" target="_blank">'+name.trim()+'</a></p></td>'
            + '<td class="hidden-md-down col-lg-2 checkbox-col orderlist-product-brand"><p class="product_brand">'+mfgName+'</p></td>'
            + '<td class="col-xs-12 col-lg-1 checkbox-col orderlist-product-price">$'+price+'</td>'
            + '<td class="col-xs-4 col-sm-3 col-lg-1 checkbox-col orderlist-product-quantity"><input type="number" class="orderlist_product_qty" value="'+qty+'" min="1" onclick="UpdateQuantity(this)" required></td>'
            + '<td class="col-xs-12 col-lg-2 checkbox-col orderlist-product-actions">'
            + '<button class="btn btn-primary form-control-submit float-xs-right float-md-left" onclick="DeleteRow(this)">Remove</button></td></tr>';

        return tableRow;
    }
}
/**
* Generates a table for 'rejected' part numbers
*/
function ShowRejects(objectName = '#ListContainer', dataList){
    if(Array.isArray(dataList) && dataList.length > 0)
    {
        $(objectName).append('<h1>Reject List ('+GetItemCount(dataList)+' Items)</h1>');
        $(objectName).append(baseTable.replace('table_orderlist', 'table_rejectlist').replace('table_body', 'table_body2'));
        $('#table_rejectlist #orderlist-product-checkbox').remove();
        $('#table_rejectlist #orderlist-product-price').remove();
        $('#table_rejectlist #orderlist-product-qty').remove();
        $('#table_rejectlist #orderlist-product-action').remove();

        for(idx in dataList)
        {
            $('#table_rejectlist #table_body2').append(CreateRejectObject(dataList[idx]));
        }
    }
}
/**
* Generates a table row for a 'rejected' part number
*/
function CreateRejectObject(reject){
    if(reject !== null){
        var partNo = reject.hasOwnProperty('reference') ? reject.reference : "";
        
        var tableRow = '<tr>'
            + '<td class="col-xs-3 col-lg-2 checkbox-col orderlist-product-partNo"><p class="product_partNo">'+partNo+'</p></td>'
            + '<td class="col-xs-7 col-lg-3 checkbox-col orderlist-product-desc"><p class="product_name">Item Not Found In Our System</p></td>'
            + '<td class="hidden-md-down col-lg-3 checkbox-col orderlist-product-brand"><p class="product_name">Unknown</p></td>'

        return tableRow;
    }    
}
/**
* Called every time a row's 'delete' button is clicked
*/
function DeleteRow(currentRow){
    var rowElement = currentRow.parentElement.parentElement;
    var partNoElement = rowElement == null ? null : rowElement.querySelector('.product_partNo');
    if(partNoElement != null && partsList.length > 0)
    {
        for(idx in partsList)
        {
            console.log('Delete Selected Row');
            if(partsList[idx].reference == partNoElement.innerHTML || GetReferenceNumber(partsList[idx])[1] == partNoElement.innerHTML)
            {
                partsList.splice(idx, 1);//overwrites original array
                rowElement.remove();
                $(orderListHeadingName).empty().append('Order List ('+GetItemCount(partsList)+' Items)');
                break;
            }
        }
    }
    if(partsList.length == 0)
    {
        $('#table_orderlist').remove();
        $(orderListHeadingName).remove();
        $(ListContainerName).prepend(warningNotice);
        $(noProductsInListName).append('There are no products to display please enter a list of comma seperated part numbers. Then click the refresh button.');
    }
    console.log(partsList);
}

/**
* Called every time a row's quantity input field is updated
*/
function UpdateQuantity(currentInput){
    
    var qty = currentInput.value;
    var rowElement = currentInput.parentElement.parentElement;
    var partNoElement = rowElement == null ? null : rowElement.querySelector('.product_partNo');
    if(partNoElement != null && partsList.length > 0){
        console.log('Update Quantity: '+partNoElement.innerHTML+' '+qty);
        for(idx in partsList)
        {
            if(partsList[idx].reference == partNoElement.innerHTML || GetReferenceNumber(partsList[idx])[1] == partNoElement.innerHTML)
            {
                qty = parseInt(qty);
                partsList[idx].toOrder = qty > 0 ? qty : 1;
                break;
            }
        }
    }
    console.log(partsList);
}