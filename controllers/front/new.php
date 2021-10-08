<?php
/**
* @author    Anthony Figueroa - Shoplync Inc <sales@shoplync.com>
* @copyright 2007-2021 Shoplync Inc
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
* @category  PrestaShop module
* @package   Bulk Purchase Order
*      International Registered Trademark & Property of Shopcreator
* @version   1.0.0
* @link      http://www.shoplync.com/
*/

/**
 * Class itself
 */
class BulkOrderNewModuleFrontController extends ModuleFrontController
{
    /**
     * For allow SSL URL
     */
    public $ssl = true;

    /**
     * String Internal controller name
     */
    public $php_self = 'new';

    public $productList = null;
    public $productDetailsList = array();
    public $productRejectList = array();

    /**
     * Sets default medias for this controller
     */
    public function setMedia()
    {
        /**
         * Set media
         */
        parent::setMedia();
        
        $this->addCSS(__PS_BASE_URI__.'modules/'.$this->module->name.'/views/css/front.css');
        $this->addJS(__PS_BASE_URI__.'modules/'.$this->module->name.'/views/js/front.js');
        
        //Tools::addJS(__PS_BASE_URI__.'modules/'.$this->module->name.'/views/js/global.js');
        $this->addJS(_THEME_DIR_.'js/history.js');
        //Tools::addJS(_THEME_DIR_.'js/history.js');
    }

    /**
     * Redirects to canonical or "Not Found" URL
     *
     * !!!! There was not parameter which generated a "strict standards" warning
     *
     * @param string $canonical_url
     */
    public function canonicalRedirection($canonical_url = '')
    {
        //parameter added to function
        $canonical_url=null;
        if (Tools::getValue('live_edit')) {
            return $canonical_url;
        }
    }

    public function getBreadcrumbLinks()
    {
        $breadcrumb = parent::getBreadcrumbLinks();

       // $breadcrumb['links'][] = $this->addMyAccountToBreadcrumb();

        return $breadcrumb;
    }

    /**
     * Initializes controller
     *
     * @see FrontController::init()
     * @throws PrestaShopException
     */
    public function init()
    {
        $this->page_name = 'new';

        $this->display_column_left = false;
        $this->display_column_right = false;

        parent::init();
    }

    /**
     * Initializes page content variables
     */
    public function initContent()
    {
        parent::initContent();

        if ($this->context->customer->isLogged()) {
            
           // $this->initSmartyVariables();
            
             $this->context->smarty->assign('link_token', Tools::getToken(false));
            $this->setTemplate('module:BulkOrder/views/templates/front/bulkorder-input.tpl');
        } else {
            Tools::redirect('index.php');
        }
    }
    
    /**
     * Initializes smarty variables
     */    
    protected function initSmartyVariables()
    {
        if(isset($productList))
            $this->context->smarty->assign('productList', $productList);
    
        if(isset($productDetailsList))
            $this->context->smarty->assign('productDetailsList', $productDetailsList);
        
        if(isset($productRejectList))
            $this->context->smarty->assign('productRejectList', $productRejectList);
    }

    /**
     * Save form data.
     */
    public function postProcess()
    {
        return parent::postProcess(); 
    }
    public function displayAjaxSubmitBulkOrder() {
        if (Tools::isSubmit('submit_parts'))
        {
            $quantityList = array();
            $productDetailsList = array();
            $productRejectList = array();
            $productList = array();
            
            $strList = Tools::getValue('submit_parts');
            
            if(Tools::isSubmit('hasQuantity') &&  Tools::getValue('hasQuantity') == "true")
            {
               $tempList = Trim(Trim($strList), ",");
               $tempList = preg_split('/\r\n|\r|\n/', $strList);
               foreach($tempList as $item)
               {
                   array_push($quantityList, explode(",", $item));
               }
               foreach($quantityList as $itemArray)
               {
                   array_push($productList, $itemArray[0]);
               }
            }
            
            if(isset($strList))
            {
                $strList = Trim(Trim($strList), ",");
                $productList = empty($productList) ? explode(",", $strList) : $productList;
                
                foreach($productList as $sku)
                {
                    $sku = Trim($sku);
                    $result = $this->searchProducts($sku, true);
                    if(is_array($result) && isset($result['notfound']))
                    {
                        error_log("NOT FOUND");
                        //part not found add to rejectList
                        $sku_obj = new stdClass();
                        $sku_obj->reference = $sku;
                        $sku_obj->prestashopProduct = false;
                        
                        array_push($productRejectList, $sku_obj);
                    }
                    else if(is_array($result) && isset($result['found']) && $result['found'])
                    {
                        error_log("FOUND");
                        array_push($productDetailsList, empty($quantityList) ? $result['products'][0] : $this->LookForQuantity($result['products'][0], $quantityList) );
                    }
                }
            }
            $returnObj = array();
            array_push($returnObj, $productDetailsList);
            array_push($returnObj, $productRejectList);
            
            $this->ajaxDie(json_encode($returnObj));
        }
        else 
        {
           $this->ajaxDie('testy2');
        }
    }

    protected function LookForQuantity($product, $qtyList)
    {
        if(isset($product) && $product != null && isset($qtyList) && !empty($qtyList))
        {
            foreach($qtyList as $skuName)
            {
                if($product['reference'] == $skuName[0] || reset($product['combinations'])['combination_reference'] == $skuName[0])
                {
                    $qty = intval($skuName[1]);
                    $product['toOrder'] = $qty != null && $qty > 0 ? $qty : 1;
                    return $product;
                }
            }
        }
        return $product;
    }
    /*
    *
    * Forked From https://github.com/PrestaShop/PrestaShop/blob/develop/controllers/admin/AdminCartRulesController.php
    *
    **/    
    protected function searchProducts($search, $strict = false)
    {
        $products;
        if($strict)
        {
            $products = $this->searchByNameStrict((int) $this->context->language->id, $search);
        }
        else
        {
            $products = Product::searchByName((int) $this->context->language->id, $search);
        }
        
        if ($products) {
            foreach ($products as &$product) {
                $combinations = [];
                $productObj = new Product((int) $product['id_product'], false, (int) $this->context->language->id);
                $attributes = $productObj->getAttributesGroups((int) $this->context->language->id);
                $product['formatted_price'] = $product['price_tax_incl']
                    ? $this->context->getCurrentLocale()->formatPrice(Tools::convertPrice($product['price_tax_incl'], $this->context->currency), $this->context->currency->iso_code)
                    : '';
                    
                $product['link_rewrite'] = $productObj->link_rewrite == null ? '' : Context::getContext()->shop->getBaseURL(true).$productObj->link_rewrite;
                
                // Get cover image for your product
                $image = Image::getCover((int) $product['id_product']);
                $link = new Link();
                $imagePath = $productObj->link_rewrite == null ? null : $link->getImageLink($productObj->link_rewrite[Context::getContext()->language->id], $image['id_image'], 'small_default');
                
                $product['image_small_default'] = $imagePath == null ? '' : $imagePath;   
                
                foreach ($attributes as $attribute) {
                    if($attribute['reference'] == $search)
                    {
                        if (!isset($combinations[$attribute['id_product_attribute']]['attributes'])) {
                            $combinations[$attribute['id_product_attribute']]['attributes'] = '';
                        }

                        $combinations[$attribute['id_product_attribute']]['attributes'] .= $attribute['attribute_name'] . ' - ';
                        $combinations[$attribute['id_product_attribute']]['id_product_attribute'] = $attribute['id_product_attribute'];
                        $combinations[$attribute['id_product_attribute']]['default_on'] = $attribute['default_on'];
                        $combinations[$attribute['id_product_attribute']]['combination_reference'] = $attribute['reference'];
                        if (!isset($combinations[$attribute['id_product_attribute']]['price'])) {
                            $price_tax_incl = Product::getPriceStatic((int) $product['id_product'], true, $attribute['id_product_attribute']);
                            $combinations[$attribute['id_product_attribute']]['formatted_price'] = $price_tax_incl
                                ? $this->context->getCurrentLocale()->formatPrice(Tools::convertPrice($price_tax_incl, $this->context->currency), $this->context->currency->iso_code)
                                : '';
                        }
                    }
                }
                if(!empty($combinations))
                {
                    foreach ($combinations as &$combination) {
                        $combination['attributes'] = rtrim($combination['attributes'], ' - ');
                    }
                }

                $product['combinations'] = $combinations;
                $product['prestashopProduct'] = true;
                $product['toOrder'] = 1;
            }
        
            return [
                'products' => $products,
                'found' => true,
            ];
        } else {
            return ['found' => false, 'notfound' => $this->trans('No product has been found.', [], 'Admin.Catalog.Notification')];
        }
    }

    /**
     * Admin panel product search. (Renmamed searchByName -> searchByNameStrict)
     *
     * @param int $id_lang Language identifier
     * @param string $query Search query
     * @param Context|null $context Deprecated, obsolete parameter not used anymore
     * @param int|null $limit
     *
     * @return array|false Matching products
     *
     * Forked from https://github.com/PrestaShop/PrestaShop/blob/6f95f94dcc41858629c43f0f099f4beede68ac67/classes/Product.php#L4855
     *
     */
    public function searchByNameStrict($id_lang, $query, Context $context = null, $limit = null)
    {
        if ($context !== null) {
            Tools::displayParameterAsDeprecated('context');
        }
        $sql = new DbQuery();
        $sql->select('p.`id_product`, pl.`name`, p.`ean13`, p.`isbn`, p.`upc`, p.`mpn`, p.`active`, p.`reference`, m.`name` AS manufacturer_name, stock.`quantity`, product_shop.advanced_stock_management, p.`customizable`');
        $sql->from('product', 'p');
        $sql->join(Shop::addSqlAssociation('product', 'p'));
        $sql->leftJoin(
            'product_lang',
            'pl',
            'p.`id_product` = pl.`id_product`
            AND pl.`id_lang` = ' . (int) $id_lang . Shop::addSqlRestrictionOnLang('pl')
        );
        $sql->leftJoin('manufacturer', 'm', 'm.`id_manufacturer` = p.`id_manufacturer`');
         
        $where = 'pl.`name` = \'' . pSQL($query) . '\'
        OR p.`ean13` = \'' . pSQL($query) . '\'
        OR p.`isbn` = \'' . pSQL($query) . '\'
        OR p.`upc` = \'' . pSQL($query) . '\'
        OR p.`mpn` = \'' . pSQL($query) . '\'
        OR p.`reference` = \'' . pSQL($query) . '\'
        OR p.`supplier_reference` = \'' . pSQL($query) . '\'
        OR EXISTS(SELECT * FROM `' . _DB_PREFIX_ . 'product_supplier` sp WHERE sp.`id_product` = p.`id_product` AND `product_supplier_reference` = \'' . pSQL($query) . '\')';

        $sql->orderBy('pl.`name` ASC');

        if ($limit) {
            $sql->limit($limit);
        }

        if (Combination::isFeatureActive()) {
            $where .= ' OR EXISTS(SELECT * FROM `' . _DB_PREFIX_ . 'product_attribute` `pa` WHERE pa.`id_product` = p.`id_product` AND (pa.`reference` = \'' . pSQL($query) . '\'
            OR pa.`supplier_reference` = \'' . pSQL($query) . '\'
            OR pa.`ean13` = \'' . pSQL($query) . '\'
            OR pa.`isbn` = \'' . pSQL($query) . '\'
            OR pa.`mpn` = \'' . pSQL($query) . '\'
            OR pa.`upc` = \'' . pSQL($query) . '\'))';
        }
        
        $sql->where($where);
        $sql->join(Product::sqlStock('p', 0));

        $result = Db::getInstance()->executeS($sql);

        if (!$result) {
            return false;
        }

        $results_array = [];
        foreach ($result as $row) {
            $row['price_tax_incl'] = Product::getPriceStatic($row['id_product'], true, null, 2);
            $row['price_tax_excl'] = Product::getPriceStatic($row['id_product'], false, null, 2);
            $results_array[] = $row;
        }

        return $results_array;
    }



}
