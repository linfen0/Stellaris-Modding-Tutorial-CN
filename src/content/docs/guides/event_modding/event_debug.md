---
title: Event 调试
sidebar:
    order: 3
---

在上一篇我们了解到了如何编写一个简单的可执行 Event，但是相信各位在自己发挥之时总会遇到这样那样的错误，要么是 Event 无法被触发，亦或是触发后并不是你想要的 Event，还可能出现无限弹窗，无法寻找到 Event 甚至崩溃的情况。当出现这些情况并在没有别人的帮助下之时，我们应该自行对自己写的代码反复进行有逻辑的测试，排查错误并加以解决，这个过程便是调试(Debug)。

由于写 Mod 并非正规编程，我们无法进行像 IDE 一样进行断点调试以及逐行读取之类的一些调试工具，因此如若遇到恶性 Bug（诸如无限弹窗 ，崩溃之类严重影响游戏运行的问题），我们只能够通过不断修改局部代码，并启动游戏从而达到调试的目的，锁定真正的错误。

虽然正常调试十分的麻烦，但庆幸的是，VSC 给予了我们语法检测这个功能，一般情况下来说，只要代码中不存在 VSC 检测的错误(Errors)，能够避免十分多的语法错误，使得我们可以将注意力集中于对代码的逻辑层面的检测（VSC 的检测功能在某些情况下将会失效，这方面我会在之后进行讲解）。在了解了调试的意义之后，我们就正式开始学习如何调试自己编写的 Mod，这是 Modder 所必须具备的技能。 注意：Event 的调试过程相比 Common 之中大部分内容的调试更加困难，需要更多的时间，调试过程将是及其枯燥的，需要做好心理准备。（modder 的游戏时长可不会比正常玩家少啊）

在这一段讲解可能会有一些模糊，因为每个人所犯的错误并不是一样的，因此我只能够粗略的讲解一下一些常见的 Event 错误以及调试过程。当我们一个 Event 并未按照我们的意愿触发之时，我们需要通过控制台进行强制触发（注意：如果 Event 存在语句 `fire_only_once = yes` ，那么该 Event 无法通过控制台触发，且每局只会检测触发一次，不论启动与否！因此在这里不建议各位使用该语句，这将使得调试更加麻烦！），然后查看触发之后的显示情况进行错误诊断（请务必保证 Event id 正确）。

## 正常触发

如若控制台能够正常触发，则是由于原 Event 触发器失效导致的，尤其是 Action 触发器一定要注意默认 Scope 要与需要触发的 Event 的 Scope 相同，其中还有当然一个因素是 Trigger 中的 Conditions 逻辑错误，这类问题只能够通过不断得进行 Condition 的增删，一步步调试从而达到能够满足自己的需求为止，在这方面没有人能够帮助到你，逻辑问题是这类问题的通病，另一个相近的问题则是是正常触发 Event 但 Effect 失效。该个问题也基本上是 Effect 语句的逻辑问题，需要自己重新对逻辑进行重构调试，Event 有内外两套执行循序，外层执行顺序是固定的（比如 `id` ， `title` ， `immediate` 一类），不会随着你写上边还是写下边而改变执行顺序，而内部逻辑（ `immediate` 内部的 Effect 语句）则是从上到下执行，这里有一个简单的记忆方法：属性语句固定顺序执行，逻辑以及效果语句从上到下依次执行。

## 无限弹窗

无限弹窗分为两类，一类是正常 Event 的无限弹出，一类是空白弹窗。前者如下：

```pdx
country_event = {
    id = test_event.0
    title = test_event.0.name
    desc = test_event.0.desc


    option = {
        name = test_event.0.aa
    }
}
```

该类很容易排查，没有写上触发模式，此时 VSC 会在无触发模式的 Event 上标记蓝色波浪线用以提示该类错误。后者则是一个恶性 Bug，导致该 Bug 的原因有暂时未确定有多少，常见的便是诸如缺少括号，采用了过时语句等等，缺少括号可以通过 VSC 快速查看，只要缺少或者多出括号，VSC 会在最后一行进行报错，但具体哪一行缺少或者多出却无从得知，此时我们可以观察到 VSC 的自动提示功能失效，并且之前的已知错误将会一同被清除！

如若我们无法迅速找到哪个地方括号出了问题，可以直接在最后放加减括号，修正到该错误提示消失为止。然后通过格式化代码修正代码结构，不过这会影响原先代码结构的美观，因此记住不要乱删除括号！此时如若排查不是括号问题，那么通常情况下最可能发生的就是不正当使用语句，我们来看这样一个示例： `allow` 的效果是满足其中的条件才能够使得 `option` 可选，不满足则变成灰色，相当于判断 Option 是否可用的 Conditions（如若你不想在不满足条件的时候隐藏该选项，则可以将 `allow` 换成 `trigger` ）， `fail_text` 则是表示如若不满足底下的 Conditions（在这里是 `NOT = {is_ai = yes}` ）而显示的一条自定义的文本，文本 Key 为“Test”。如若是这样写的话，那么这个 Event 被执行之后将会无限制的弹出空白窗口，选项仅仅只有一个“OK”，此时如若我们删除掉这个 `fail_text` 则该 Event 又将变得正常了。

```odx
option = {
    name = test_event.0.aa
    allow = {
        fail_text = {
            text = Test
        }
        is_ai = yes
    }
}
```

此时查阅 Wiki 我们可以看到，该语句应用在 Description 上。

Wiki 说明这要用于 `TriggerDescription` （一种 Desc 的形式，带条件的 Description 组，满足不同条件能够选定不同的本地化 Key，下面展示写法）上，但是我发现 VSC 貌似并没有 `fail_text` 的语句提示，并且输入之后还会报错。

但问题又来了，香草(Vanilla)文件似乎并没有在 `TriggerDescription` 采用这种写法，而是在自定义文本提示( `custom_tool_tip` )当中采用了这种写法，此时我们仿照原文件进行书写：

```pdx
option = {
    name = test_event.0.aa
    allow = {
        custom_tooltip = {
            fail_text = test
            is_ai = yes
        }
    }
}
```

此时启动 Event 发现已经能够正常启动并达到我们想要的效果。这个时候我们就有理由相信 VSC 提示的是过时语句，但检测并未过时，同时 Wiki 上的语句解释应当是过时的。通过这个示例我们可以了解到，使用一个 Effect 语句需要优先查找 Wiki，然后再寻找原文件对应语句进行确认是否有效，并从中查找有效属性进行 Effect 语句效果细节扩充，这样就能正确使用 Effect 语句且能够避免语句使用错误的 Bug，但是很多 Effect 语句中的属性并未注明如何使用，因此这需要自己的猜想并进行大量尝试研究，并可以尝试将自己的人实验结果记录下来，即可以方便自己以后使用，也可以帮助后来人节约研究时间(毕竟蠢驴没有语句解析文档，还是太蠢了)。

## 游戏崩溃

导致游戏崩溃的因素有很多，但基本都能够被 VSC 检测出来，也就是说你能够清除 VSC 上的错误，基本上不会崩溃。当然，VSC 也会误报，有些认为绝对没有出错的地方产生了红线也可以不必理会（这方面只能自己多试），主要出现在变量操作以及认为“不正当”使用语句（比如原文件没有出现过的格式亦或是过时格式）。当崩溃之时，能够从蠢驴遗言中寻找到一些蛛丝马迹，在祖传文件夹 `Paradox Interactive\Stellaris\crashes` 中，每次崩溃都会生成一个文件夹，里面有一个 `logs` 子文件夹，进入之后会有两个文件， `error.log` 便是我们需要的，进入该文件就能够看到游戏运行当中的几乎所有错误，其他基本都可以忽略（说不定能从中找出一些隐藏 bug），直接翻到最底下一行错误，这通常是蠢驴最后的遗言，如果该错误已经被证实并不影响游戏，那么很抱歉，暴毙速度太快，还没来得及说出遗言就崩溃了，此时只能够手动慢慢查找错误了。

## 未寻找到 Event

:::note[提示]

蠢驴在某次更新之中修复了该问题，现在调用空 event 不会导致崩溃！

:::

这类错误经常是固定的三个方面出错：

1. 未先声明名称空间，此时加上名称空间即可。
2. 文本编码格式错误，采用了 `UTF-8-BOM` 以外的编码格式，编码格式在右下显示(VSC)，而我们只需要点击编码格式就会出现两个选项，我们先通过 `UTF-8-BOM` 编码格式保存，再点击右下角一次选择用 `UTF-8-BOM` 打开即可（必须先用指定编码格式保存才能再打开！编码调整在右下角）。
3. Event id 出错，使用了不正当的 id 命名方式，未按照指定格式进行 id 命名，或者是 id 的序号过大。尽管在原文件中使用了超过四位数的 id 序号，但是这里建议 id 序号不要超过四位数，也就是不要超过 9999，以免发生不必要的 Bug。

> 关于蠢驴 Event id 还有一点需要注意的是，` .01` 与` .1` 的 id 是相同的，即序号视作为无符号整数，也就是说这是两个相同的 Event，只会启用先加载的 Event 的效果，写在后边的则直接忽略不进行加载（这里指的前后是），这就涉及到了 Event 的覆写模式了。蠢驴的 Event 覆写机制与其他内容不太相同，其他文件内容大部分都是后加载的同名项目覆盖先加载的项目，但是 Eevnt 一旦加载完毕，不会加载后边的同名项目，而是直接忽视。也就是说同名 Event 无法正常覆写，只能加载一次。因此当需要覆写其他文件中的 Event 之时，请保证自己的文件能够先于需要覆盖的 Event 所在文件之前加载（就是你的文件排序要在被覆写的文件之前）

```pdx
namespace = test_event

country_event = {
    id = test_event.0
    hide_window = yes
    is_triggered_only = yes

    immediate = {
        log = "测试一"
    }
}
country_event = {
    id = test_event.0
    hide_window = yes
    is_triggered_only = yes

    immediate = {
        log = "测试二"
    }
}
```

上图的 id 名称事实上是相同的，这和蠢驴内部真正 Event id 的分配模式有关。由于同名，第一个 `Event id = SA_Boot_Deveice.01` 加载完之后将不会再加载第二个 `Event id = SA_Boot_Deveice.1` ,也就是说不论执行哪个 Event，都是执行第一个 Event 的效果（ `log` 的效果是在游戏运行的日志(log)上打印后边引号内的内容），因此在执行之后将会在 log 上打印“测试一”。
其实本来一开始应该先讲解 log 的，但是我认为一般来说 log 的意义不大，蠢驴本身游戏都有一堆的错误，而且这种错误只能够告诉你啥地方有错，并不会提示你哪方面错了，而且我们有了 VSC 后大部分情况下避免诸如语法错误，作用域(Scope)错误的问题（关于 VSC 对作用域确定的帮助将会在后面讲解）。当然，编写纯逻辑语句（比如天灾的 AI 逻辑）之时，我们可以通过在 Effect 中采用 log 的形式来提醒自己逻辑的执行情况。当然，也有一些错误只能够通过 log 查看的，所以调试过程中这部分内容也应当结合进去。
最后，如果各位已经完全认为自己的 Event 没有任何问题，但是就是出现这样那样的问题，这时候只能依靠玄学了（此时你可以认为蠢驴读取 Mod 可能出现了一点 Bug），改变该 Event 组的 `namespace` ，也就是换一个名称空间。目前还不能确定名称空间的正确命名方式，目前已知的某些信息是：

1. 可以参杂下划线。
2. `namespace` 中存在大写字母将可能导致一些问题，不过概率比较小。
3. 不要在 `namespace` 中使用` .` ，这可能导致 Event id 的识别错误。

关于调试的内容差不多就这些了，接下来还是得靠各位在平时不断的错误当中寻找属于自己的一套解决方案，多查资料以及不断调式是解决 Error 的唯一方法。