---
layout: post
title: iOS - 自定义导航栏
category: original
tags: iOS,Objective-C
---

![picture]({{site.baseurl}}/assets/original/JIMNavigationBar.gif)

[GitHub](https://github.com/SilverJkm/JIMNavigationBar)

>如果要使用Storyboard，请确认你的UIBarButtonItem的customView存在并且为UIButton

<!-- more -->


## 先说说UINavigationBar的问题
##### 1. 返回按钮的问题: 
  下面两种方式，不是使用category，就是使用继承，还有最坑的就是一个一个的写。

  - 设置返回按钮无文字自定义图标:  
      {% highlight objc %}
        [[UINavigationBar appearance] setBackIndicatorImage:[UIImage imageNamed:@"back"]];
        self.navigationItem.backBarButtonItem = [[UIBarButtonItem alloc]initWithTitle:@"" style:UIBarButtonItemStylePlain target:nil action:nil];
        {% endhighlight objc %}

>结果是: 导致响应热区过大
>![picture]({{site.baseurl}}/assets/original/JIMNavigationBarBackItem.png)

- 使用leftItem来自定义返回按钮:
  {% highlight objc %}
  __weak typeof(self) weakSelf = self;
  self.navigationItem.leftBarButtonItem = [UIBarButtonItem itemWithImageName:@"back" block:^(id  _Nonnull sender) {
     [weakSelf.navigationController popViewControllerAnimated:YES];
  }];
  {% endhighlight objc %}

>结果是: 手势返回动画没有了，点击屏幕的左边界无响应(因为不在point不在leftItem内)，iOS11下UIToolBar又被改了🙃
>![picture]({{site.baseurl}}/assets/original/JIMNavigationBarLeftItem.png)

##### 2. 导航栏背景色问题
  * 之前做过一个监听转场动画百分比、颜色渐变色的导航栏，但是基于UINavigationBar你就是解决不了上面的问题😢
  * 🤐🤐🤐🤐

## 正文
突然有一天产品给我说: 怎么有些地方的返回按钮的热区过大，有些地方点击按钮的左边又没用啊。😡😡😡，我说：我试试。

##### 1.  自定义导航栏的视图层级
 * 在navigationBarController.view上?  需要写转场动画，还需要统一控制，多个ViewController只有一个navigationBar，岂不是和UINavigationBar一样了？想想就头疼。
 * 在self.view上?  隐藏原生UINavigationBar，一个ViewController一个navigationBar，一对一的关系，转场动画的时候只需要跟着self.view一起动画就行了，so easy!

##### 2.  怎么解决上面的所有的问题，并在修改原有代码最少的情况下替换掉UINavigationBar
*  使用category + method swizzling
*  对自定义基类或者UIViewController执行method swizzling
*  使用UIToolbar来对self.navigationItem. * 进行显示
    *  获取self.navigationItem. *，交给自定义导航栏持有，并且self.navigationItem. * = nil
    *  [leftItem or backItem] + [titleLable or titleView] + [rightItem] 
    *  得到一个拥有所有的item的数组，交给UIToolbar显示
*  消除左右的默认边距
     * 左移x，宽度增加2x，self.view.clipBounds = YES
*  增加响应热区: 
     * 增加最左边的item的内部左间距和最右边的item的内部右间距，所以要求item的customView必须为UIButton，通过titleInset和imageInset实现
 *  背景色 
    * 针对iOS9 和iOS10以后的，将背景视图放在不同的地方

##### 3. 后续问题
  * leftItem，title，rightItem的改变: KVO然后刷新UIToolbar
  * 当一个自定义导航栏没有使用了默认的背景色，后续的自定义导航栏应该继续使用这个颜色，并且忽略Alpha通道的值。

{% highlight objc %}
bool CGColorEqualToColorIgnoreAlpha(CGColorRef color1,CGColorRef color2){
    if(!color1 || !color2) return false;
    // R G B A 数组长度是CGColorSpaceGetNumberOfComponents + 1
    const CGFloat *a = CGColorGetComponents(color1); 
    const CGFloat *b = CGColorGetComponents(color2);
    NSUInteger aCount = CGColorSpaceGetNumberOfComponents(CGColorGetColorSpace(color1));
    NSUInteger bCount = CGColorSpaceGetNumberOfComponents(CGColorGetColorSpace(color2));
    if (aCount != bCount) return false;
    for (NSUInteger index=0 ; index < aCount; index++) {
        if (a[index] != b[index]) return false;
    }
    return true;
}
{% endhighlight objc %}