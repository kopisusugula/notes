---
layout: post
title: La méthode de DHH pour organiser les contrôleurs Rails
date: 2016-02-19 23:00
category: ruby
permalink: /la-methode-de-dhh-pour-organiser-les-controleurs-rails/
image: /uploads/2016-02-20-la-methode-de-dhh-pour-organiser-les-controleurs-rails/basecamp3.png
---

Dans [une interview](http://www.fullstackradio.com/32), [David Heinemeier Hansson](https://twitter.com/dhh) a partagé une pratique mise en place pour la réécriture de [Basecamp](https://basecamp.com/) pour la version 3.

Basecamp comporte beaucoup de contrôleurs comme le montre le [`rails stats`](https://twitter.com/dhh/status/700724641812377602):

![Stats Basecamp 3](/uploads/2016-02-20-la-methode-de-dhh-pour-organiser-les-controleurs-rails/basecamp3.png)

DHH a justifié ce nombre par le fait que lui et son équipe ont décidé que tout ce qui n'était pas une méthode REST devait conduire à la création d'un nouveau contrôleur.

Donc les contôleurs doivent comporter uniquement les méthodes:

- `index`
- `show`
- `new`
- `create`
- `edit`
- `update`
- `destroy`

Tout ajout d'une autre méthode conduit à la création d'un nouveau contrôleur.

Par exemple:

**Avant:**

```ruby
class InboxesController < ApplicationController
  before_action :foo, only: [:show]
  before_action :bar, only: [:pending]
  before_action :baz, only: [:drafts]

  def show
  end

  def index
  end

  def pendings
  end

  def drafts
  end
end
```

**Après:**

```ruby
class InboxesController < ApplicationController
  before_action :foo, only: [:show]

  def show
  end

  def index
  end
end
```

```ruby
class Inboxes::PendingsController < ApplicationController
  before_action :bar, only: [:index]

  def index
  end
end
```

```ruby
class Inboxes::DraftsController < ApplicationController
  before_action :baz, only: [:index]

  def index
  end
end
```

Voici un transcript de la partie où il en parle, à partir de [50:15](http://www.fullstackradio.com/32):

> What I've come to embrace is that being almost fundamentalistic about when I create a new controller to stay adherent to REST has served me better every single time. Every single time I've regretted the state of my controllers is because I've had to few of them. I've been trying to overload too heavily [...]. The heuristic I use to drive that is whenever I have a method in a controller that's not part of the default five or whatever REST actions that we have by default: make a new controller. Let's say you have an "inbox" controller and you have an "index" that shows everything that's in the inbox and then you might have an action like "I wanna see the pending emails", so you add an action called "pending", that's a common pattern, right ? And a pattern that I used to follow more. And now I go no no no: have a new controller that's called Inboxes::PendingsController that just has a single method called "index". And what I found is that the freedom that gives you is that each controller now has its own scope with its own set of filters that apply [...]. Let's say we have a MessagesController and below that MessagesController when might have a Messages::DraftsController and we might have a Messages::TrashesController and we might have all these others controllers and all these others subresources within the same thing. That's been a huge success.
